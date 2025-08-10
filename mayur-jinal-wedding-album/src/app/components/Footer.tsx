export default function Footer() {
  return (
    <footer className="bg-light border-top py-4 mt-auto">
      <div className="container d-flex flex-column flex-md-row align-items-center justify-content-between">
        <div className="text-muted small">© {new Date().getFullYear()} Mayur & Jinal Wedding Album</div>
        <div className="d-flex gap-3 mt-2 mt-md-0">
          <a className="text-muted small" href="#">Privacy</a>
          <a className="text-muted small" href="#">Terms</a>
          <a className="text-muted small" href="#">Contact</a>
        </div>
      </div>
    </footer>
  );
}
