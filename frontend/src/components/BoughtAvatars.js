'use client'

import { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import toast from 'react-hot-toast';

export default function BoughtAvatars() {
  const [boughtAvatars, setBoughtAvatars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    const fetchBoughtAvatars = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        console.log(user.token);
        const response = await axios.get('http://localhost:3001/api/avatar/my-avatars', {
          headers: {
            Authorization: `Bearer ${user.token}`
          }
        });
        if (response.data.success) {
          setBoughtAvatars(response.data.data);
        } else {
          setError(response.data.message || 'Failed to fetch bought avatars');
          toast.error(response.data.message || 'Failed to fetch bought avatars');
        }
        setLoading(false);
      } catch (err) {
        const errorMessage = err.response?.data?.message || 'Failed to fetch bought avatars';
        setError(errorMessage);
        toast.error(errorMessage);
        setLoading(false);
      }
    };

    fetchBoughtAvatars();
  }, [user]);

  const handleBack = () => {
    router.back();
  };

  const handleSetDefault = async (avatarId) => {
    try {
      const response = await axios.post(
        `http://localhost:3001/api/user/set-default-avatar/${avatarId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${user.token}`
          }
        }
      );

      if (response.data.success) {
        toast.success('Default avatar updated successfully');
        // Update the UI to show which avatar is selected
        setBoughtAvatars(prevAvatars =>
          prevAvatars.map(avatar => ({
            ...avatar,
            isDefault: avatar._id === avatarId
          }))
        );
      } else {
        toast.error(response.data.message || 'Failed to set default avatar');
      }
    } catch (err) {
      console.error('Error setting default avatar:', err);
      const errorMessage = err.response?.data?.message || 'Failed to set default avatar';
      toast.error(errorMessage);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-900 text-gray-300 text-lg">
        Loading bought avatars...
      </div>
    );
  }

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
          My Avatars
        </h1>

        {error && (
          <div className="mb-8 p-4 bg-red-900/50 border border-red-700 rounded-lg text-red-200 text-center">
            {error}
          </div>
        )}

        {boughtAvatars.length === 0 ? (
          <div className="text-center text-gray-400 text-lg">
            You haven't purchased any avatars yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {boughtAvatars.map((avatar) => (
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
                    onClick={() => handleSetDefault(avatar._id)}
                    className={`w-full py-2 px-4 rounded-lg transition-colors ${
                      avatar.isDefault
                        ? 'bg-green-600 text-white hover:bg-green-700'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    {avatar.isDefault ? 'Selected' : 'Select as Default'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 