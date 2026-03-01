import { useEffect, useState } from 'react';
import { supabase } from '../../../supabaseClient';

const Profile = () => {
    const [solvedCount, setSolvedCount] = useState(0);
    const [user, setUser] = useState(null);

    useEffect(() => {
        const getProfileData = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                setUser(user);
                // This assumes your friend has a 'solved_problems' table
                const { count, error } = await supabase
                    .from('solved_problems')
                    .select('*', { count: 'exact', head: true })
                    .eq('user_id', user.id);

                if (!error) setSolvedCount(count || 0);
            }
        };
        getProfileData();
    }, []);

    return (
        <div style={{ padding: '20px', color: 'white' }}>
            <h1>My Profile</h1>
            {user && <p>Email: {user.email}</p>}
            <div style={{ background: '#1e1e1e', padding: '20px', borderRadius: '8px' }}>
                <h2>Problems Solved: {solvedCount}</h2>
            </div>
        </div>
    );
};

export default Profile;