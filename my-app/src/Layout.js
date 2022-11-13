import { Outlet, Link } from "react-router-dom";
import PrimaryAppBar from "./screens/PrimaryAppBar";

export default function Layout (props) {
    return (
        <>
            <PrimaryAppBar colorblindMode={props.colorblindMode} setColorblindMode={props.setColorblindMode} user={props.user} setPageStatus={props.setPageStatus} pageStatus={props.pageStatus} />
            <div style={{ marginTop: "40px" }}>
                <Outlet />
            </div>
        </>
    );
}