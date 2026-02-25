import AudioGenerator from '@/components/admin/AudioGenerator';
import StatusMaker from '@/components/admin/StatusMaker';

export default function AdminPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-serif mb-8">Admin Panel</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <AudioGenerator />
        <StatusMaker />
      </div>
    </div>
  );
}
