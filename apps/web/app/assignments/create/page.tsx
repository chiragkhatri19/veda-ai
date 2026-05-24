import Step1_UploadDetails from '@/components/create/Step1_UploadDetails';

export const metadata = {
  title: 'Create Assignment | VedaAI',
};

export default function CreateAssignmentPage() {
  return (
    <div className="flex justify-center px-4 sm:px-6 py-6">
      <div className="w-full max-w-2xl">
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
            <h1 className="text-[22px] font-bold text-app-text-primary">Create Assignment</h1>
          </div>
          <p className="text-[13px] text-app-text-secondary ml-4">Set up a new assignment for your students.</p>
        </div>

        <Step1_UploadDetails />
      </div>
    </div>
  );
}
