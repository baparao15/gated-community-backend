import { Link } from 'react-router-dom';
import Button from '../components/ui/Button';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-6">
      <span className="material-symbols-outlined text-primary text-[64px] mb-4">explore_off</span>
      <h1 className="font-headline-lg text-headline-lg text-on-surface mb-2">Page not found</h1>
      <p className="text-on-surface-variant text-body-md mb-8">The page you're looking for doesn't exist.</p>
      <Link to="/">
        <Button>Back to Home</Button>
      </Link>
    </div>
  );
}
