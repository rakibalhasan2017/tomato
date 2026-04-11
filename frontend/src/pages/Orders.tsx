import { Navbar } from '../components/Navbar';

export const Orders = () => {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h2 className="text-2xl font-bold mb-6">Your Orders</h2>
        <div className="bg-white rounded-xl shadow-md p-10 text-center">
          <span className="text-4xl mb-4 block">📦</span>
          <p className="text-gray-500">You haven't placed any orders yet.</p>
        </div>
      </main>
    </div>
  );
};

export default Orders;
