import Header from "../header/Header.jsx";
import Footer from "../footer/Footer.jsx";
import {Outlet} from "react-router-dom";

export default function DefaultLayout() {
    return (
        <>
            <Header />
            <Outlet/>
            <Footer/>
        </>
    );
}