import React, { useEffect, useState } from 'react';
import './UserProfile.css';
function UserProfile() {
  const [apiData, setApiData] = useState('');

  useEffect(() => {
    const url = "http://192.168.10.16:5001/dental-clinic/user/profile";

    const getDatas = async () => {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
          'X-Refresh-Token': localStorage.getItem('refreshToken'),
        },
      });
      console.log(response);
      const data = await response.json();
      setApiData(data);
      console.log(data);
    };
    getDatas();
  }, []);

  return (
    <>
      <div className="profile_section">
        <div className="user_data_container">
          {{ apiData }}
        </div>
      </div>
    </>
  );
}

export default UserProfile;
