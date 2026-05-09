import Taskbar from "./Taskbar";

export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <div>
            <Taskbar />
            <main>{children}</main>
        </div>
    );
}