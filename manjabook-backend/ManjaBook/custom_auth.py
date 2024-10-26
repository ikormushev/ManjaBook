from django.contrib.auth import get_user_model
from django.utils.translation import gettext_lazy as _
from rest_framework import HTTP_HEADER_ENCODING, authentication
from rest_framework.request import Request

from rest_framework_simplejwt.exceptions import AuthenticationFailed, InvalidToken, TokenError
from rest_framework_simplejwt.settings import api_settings

from rest_framework_simplejwt.tokens import Token
from rest_framework_simplejwt.utils import get_md5_hash_password


class JWTAuthentication(authentication.BaseAuthentication):
    """
    An authentication plugin that authenticates requests through a JSON web
    token provided in a request header.
    """

    www_authenticate_realm = "api"
    media_type = "application/json"

    def __init__(self, *args, **kwargs) -> None:
        super().__init__(*args, **kwargs)
        self.user_model = get_user_model()

    def authenticate(self, request: Request):
        cookie = request.COOKIES.get("token")
        if cookie is None:
            return None
        raw_token = cookie.encode(HTTP_HEADER_ENCODING)
        validated_token = self.get_validated_token(raw_token)
        return self.get_user(validated_token), validated_token

    def get_validated_token(self, raw_token: bytes) -> Token:
        """
        Validates an encoded JSON web token and returns a validated token
        wrapper object.
        """
        messages = []
        for AuthToken in api_settings.AUTH_TOKEN_CLASSES:
            try:
                return AuthToken(raw_token)
            except TokenError as e:
                messages.append(
                    {
                        "token_class": AuthToken.__name__,
                        "token_type": AuthToken.token_type,
                        "message": e.args[0],
                    }
                )

        raise InvalidToken(
            {
                "detail": _("Given token not valid for any token type"),
                "messages": messages,
            }
        )

    def get_user(self, validated_token: Token):
        """
        Attempts to find and return a user using the given validated token.
        """
        try:
            user_id = validated_token[api_settings.USER_ID_CLAIM]
        except KeyError:
            raise InvalidToken(_("Token contained no recognizable user identification"))

        try:
            user = self.user_model.objects.get(**{api_settings.USER_ID_FIELD: user_id})
        except self.user_model.DoesNotExist:
            raise AuthenticationFailed(_("User not found"), code="user_not_found")

        if not user.is_active:
            raise AuthenticationFailed(_("User is inactive"), code="user_inactive")

        if api_settings.CHECK_REVOKE_TOKEN:
            if validated_token.get(
                api_settings.REVOKE_TOKEN_CLAIM
            ) != get_md5_hash_password(user.password):
                raise AuthenticationFailed(
                    _("The user's password has been changed."), code="password_changed"
                )

        return user


class JWTStatelessUserAuthentication(JWTAuthentication):
    """
    An authentication plugin that authenticates requests through a JSON web
    token provided in a request header without performing a database lookup to obtain a user instance.
    """

    def get_user(self, validated_token: Token):
        """
        Returns a stateless user object which is backed by the given validated
        token.
        """
        if api_settings.USER_ID_CLAIM not in validated_token:
            # The TokenUser class assumes tokens will have a recognizable user
            # identifier claim.
            raise InvalidToken(_("Token contained no recognizable user identification"))

        return api_settings.TOKEN_USER_CLASS(validated_token)


JWTTokenUserAuthentication = JWTStatelessUserAuthentication


def default_user_authentication_rule(user) -> bool:
    # Prior to Django 1.10, inactive users could be authenticated with the
    # default `ModelBackend`.  As of Django 1.10, the `ModelBackend`
    # prevents inactive users from authenticating.  App designers can still
    # allow inactive users to authenticate by opting for the new
    # `AllowAllUsersModelBackend`.  However, we explicitly prevent inactive
    # users from authenticating to enforce a reasonable policy and provide
    # sensible backwards compatibility with older Django versions.
    return user is not None and user.is_active
