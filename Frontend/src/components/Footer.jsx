
function Footer() {
    return (
        <footer className="fixed bottom-0 w-full bg-slate-900 text-slate-300 py-4 px-6 mt-auto">
            <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-2">
                <p className="text-sm">
                    © {new Date().getFullYear()} Lab Manager. All rights reserved.
                </p>

                <p className="text-sm text-slate-400">
                    Lab Borrowing Management System
                </p>
            </div>
        </footer>
    );
}

export default Footer;
