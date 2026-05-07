import { useForm } from 'react-hook-form';

const Register = () => {
  const { register, handleSubmit } = useForm();

  const onSubmit = (data: any) => {
    console.log("Registration Data:", data);
    // This will eventually call your axiosInstance
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] bg-gray-50">
      <form 
        onSubmit={handleSubmit(onSubmit)} 
        className="w-full max-w-md p-8 bg-white rounded-xl shadow-lg border border-gray-200"
      >
        <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">Create Account</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input {...register("name")} className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition" placeholder="John Doe" />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
            <input {...register("email")} type="email" className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition" placeholder="john@example.com" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Select Role</label>
            <select {...register("role")} className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition">
              <option value="customer">Customer</option>
              <option value="vendor">Vendor</option>
            </select>
          </div>

          <button type="submit" className="w-full bg-blue-600 text-white p-3 rounded-lg font-bold hover:bg-blue-700 transition-all transform active:scale-95">
            Sign Up
          </button>
        </div>
      </form>
    </div>
  );
};

export default Register;