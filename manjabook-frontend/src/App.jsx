import {Routes, Route} from 'react-router-dom';
import RecipesDashboard from './components/recipesDashboard/RecipesDashboard.jsx';
import Home from "./components/home/Home.jsx";
import DefaultLayout from "./components/defaultLayout/DefaultLayout.jsx";
import BlankLayout from "./components/blankLayout/BlankLayout.jsx";
import Register from "./utils/register/Register.jsx";
import PageNotFound from "./components/pageNotFound/PageNotFound.jsx";
import Login from "./utils/login/Login.jsx";
import AuthProvider from "./context/authProvider/AuthProvider.jsx";
import Profile from "./components/profile/Profile.jsx";
import RecipeCreator from "./components/recipeCreator/RecipeCreator.jsx";
import ProtectedRoute from "./utils/protectedRoute/ProtectedRoute.jsx";
import RecipeDetail from "./components/recipeDetail/RecipeDetail.jsx";
import {useError} from "./context/errorProvider/ErrorProvider.jsx";
import {useSuccess} from "./context/successProvider/SuccessProvider.jsx";
import BaseNotification from "./utils/baseNotification/BaseNotification.jsx";
import ProfilesDashboard from "./components/profilesDashboard/ProfilesDashboard.jsx";

export default function App() {
    const { error, clearError } = useError();
    const { success, clearSuccess } = useSuccess();

    return (
        <>
            {error && <BaseNotification notification={error} clearNotification={clearError} notificationType="error" />}
            {success && <BaseNotification notification={success} clearNotification={clearSuccess} notificationType="success" />}
            <AuthProvider>
                <Routes>
                    <Route element={<DefaultLayout/>}>
                        <Route path="/" element={<Home/>}/>
                        <Route path="/recipes" element={<RecipesDashboard/>}/>
                        <Route path="/recipes/:recipeID/:recipeSlug" element={<RecipeDetail/>}/>
                        <Route path="/profiles" element={<ProfilesDashboard/>}/>
                        <Route path="/profiles/:userID" element={<Profile/>}/>

                        <Route element={<ProtectedRoute/>}>
                            <Route path="/create-recipe" element={<RecipeCreator/>}/>
                        </Route>

                        <Route path="*" element={<PageNotFound/>}/>
                    </Route>

                    <Route element={<BlankLayout/>}>
                        <Route path="/register" element={<Register/>} exact/>
                        <Route path="/login" element={<Login/>} exact/>
                    </Route>
                </Routes>
            </AuthProvider>
        </>
    );
};
