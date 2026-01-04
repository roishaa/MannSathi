import AdminSidebar from "../../components/admin/AdminSidebar";

export default function AppointmentsList() {
  return (
    <div className="flex">
      <AdminSidebar />
      <main className="flex-1 p-8">
        <h2 className="text-2xl font-bold mb-4">Appointments</h2>
        <div className="bg-white p-6 rounded-xl shadow">
          Coming soon: view all appointments/sessions.
        </div>
      </main>
    </div>
  );
}
