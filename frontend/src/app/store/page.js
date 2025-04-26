'use client'

import { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import toast from 'react-hot-toast';

export default function StorePage() {
  const [avatars, setAvatars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    const fetchAvatars = async () => {
      try {
        const response = await axios.get('http://localhost:3001/api/avatar');
        if (response.data.success) {
          setAvatars(response.data.data);
        } else {
          setError(response.data.message || 'Failed to fetch avatars');
        }
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch avatars');
        setLoading(false);
      }
    };

    fetchAvatars();
  }, []);

  const handlePurchase = async (avatarId) => {
    if (!user) {
      toast.error('Please login to purchase avatars');
      return;
    }

    try {
      const response = await axios.post(
        `http://localhost:3001/api/avatar/purchase/${avatarId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${user.token}`
          }
        }
      );
      if (response.data.success) {
        toast.success('Avatar purchased successfully!');
        router.refresh();
        const avatarsResponse = await axios.get('http://localhost:3001/api/avatar');
        if (avatarsResponse.data.success) {
          setAvatars(avatarsResponse.data.data);
        }
      } else {
        toast.error(response.data.message || 'Failed to purchase avatar');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to purchase avatar');
    }
  };

  const handleBack = () => {
    router.back();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-900 text-gray-300 text-lg">
        Loading avatars...
      </div>
    );
  }

  // if (error) {
  //   return (
  //     <div className="flex justify-center items-center min-h-screen bg-gray-50 text-red-600 text-lg">
  //       {error}
  //     </div>
  //   );
  // }

  return (
    <div className="min-h-screen w-full bg-gray-900">
      <div className="p-8 max-w-7xl mx-auto">
        <button 
          onClick={handleBack}
          className="mb-6 px-6 py-2 bg-gray-800 text-gray-200 rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2 font-medium"
        >
          <span className="text-xl">←</span> Back
        </button>
        
        <h1 className="text-4xl font-bold text-gray-100 mb-8 text-center border-b border-gray-700 pb-4">
          Avatar Store
        </h1>

        <div className="flex justify-end mb-8">
          <button
            onClick={() => router.push('/my-avatars')}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 font-medium"
          >
            My Avatars
          </button>
        </div>

        {error && (
          <div className="mb-8 p-4 bg-red-900/50 border border-red-700 rounded-lg text-red-200 text-center">
            {error}
          </div>
        )}
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {avatars.map((avatar) => (
            <div 
              key={avatar._id} 
              className="bg-gray-800 rounded-xl shadow-lg overflow-hidden transition-transform hover:-translate-y-1"
            >
              <img 
                src={avatar.imageUrl} 
                alt={avatar.name} 
                className="w-full h-48 object-cover"
              />
              <div className="p-4">
                <h3 className="text-xl font-semibold text-gray-100 mb-2">{avatar.name}</h3>
                <p className="text-gray-400 mb-2">{avatar.description}</p>
                <p className="text-green-400 font-semibold mb-4">Price: {avatar.price}</p>
                <button 
                  onClick={() => handlePurchase(avatar._id)}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Purchase
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
