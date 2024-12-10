import {Routes, Route} from 'react-router-dom';
import RecipesDashboard from './components/recipesDashboard/RecipesDashboard.jsx';
import Home from "./components/home/Home.jsx";
import DefaultLayout from "./components/defaultLayout/DefaultLayout.jsx";
import BlankLayout from "./components/blankLayout/BlankLayout.jsx";
import Register from "./utils/register/Register.jsx";
import PageNotFound from "./components/pageNotFound/PageNotFound.jsx";
import Login from "./utils/login/Login.jsx";
import Logout from "./utils/logout/Logout.jsx";
import AuthProvider from "./context/authProvider/AuthProvider.jsx";
import Profile from "./components/profile/Profile.jsx";
import RecipeCreator from "./components/recipeCreator/RecipeCreator.jsx";
import ProtectedRoute from "./utils/protectedRoute/ProtectedRoute.jsx";
import RecipeDetail from "./components/recipeDetail/RecipeDetail.jsx";

export default function App() {
    return (
        <AuthProvider>
            <Routes>
                <Route element={<DefaultLayout/>}>
                    <Route path="/" element={<Home/>}/>
                    <Route path="/recipes" element={<RecipesDashboard/>}/>
                    <Route path="/recipes/:recipeID/:recipeSlug" element={<RecipeDetail/>}/>
                    <Route path="/profile/:userID" element={<Profile/>}/>

                    <Route element={<ProtectedRoute/>}>
                        <Route path="/create-recipe" element={<RecipeCreator/>}/>
                    </Route>

                    <Route path="*" element={<PageNotFound/>}/>
                </Route>

                <Route element={<BlankLayout/>}>
                    <Route path="/register" element={<Register/>} exact/>
                    <Route path="/login" element={<Login/>} exact/>
                    <Route path="/logout" element={<Logout/>} exact/>
                </Route>
            </Routes>
        </AuthProvider>
    );
};
