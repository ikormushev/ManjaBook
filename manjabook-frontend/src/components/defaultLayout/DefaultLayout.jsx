import Header from "../header/Header.jsx";
import Footer from "../footer/Footer.jsx";
import {Outlet} from "react-router-dom";

export default function DefaultLayout() {
    return (
        <div
            style={{
                display: 'flex',
                flexDirection: 'column',
                minHeight: '100vh',
            }}
        >
            <Header />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <Outlet />
            </div>
            <Footer />
        </div>
    );
}