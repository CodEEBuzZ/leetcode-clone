import { useEffect, useState } from 'react';
import { supabase } from '../../../supabaseClient';
import { Link } from 'react-router-dom';

const Topbar = () => {
    const [user, setUser] = useState(null);

    useEffect(() => {
        const getUser = async () => {
            const { data } = await supabase.auth.getUser();
            setUser(data.user);
        };
        getUser();
    }, []);

    return (
        <nav style={{
            display: 'flex', justifyContent: 'space-between', padding: '10px 20px',
            background: '#0a0a0a', borderBottom: '1px solid #333', alignItems: 'center'
        }}>
            <Link to="/" style={{ color: '#ffa116', fontWeight: 'bold', textDecoration: 'none' }}>LEETCLONE</Link>

            {user ? (
                <Link to="/profile" style={{ textDecoration: 'none' }}>
                    <div style={{
                        width: '32px', height: '32px', borderRadius: '50%', background: '#ffa116',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'black'
                    }}>
                        {user.email[0].toUpperCase()}
                    </div>
                </Link>
            ) : (
                <Link to="/login" style={{ color: '#fff' }}>Login</Link>
            )}
        </nav>
    );
};

export default Topbar;