import { useEffect, useState } from 'react';
import { useRestaurant } from '../context/restaurant-context';
import { useAuth } from '../context/auth-context';
import { getMyRestaurant } from '../services/api';

export const RestaurantPage = () => {
    const { restaurant } = useRestaurant();
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchRestaurant = async () => {
            try {
                if (!user?.id) {
                    setError('No user found');
                    return;
                }
                const response = await getMyRestaurant(user.id);
                console.log(response);

            } catch (error) {
                console.error('Error fetching restaurant:', error);
                setError('Failed to fetch restaurant');
            } finally {
                setLoading(false);
            }
        };
        fetchRestaurant();
    }, []);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error: { error } </div>;
    }

    return (
        <div>
        <h1>Restaurant </h1>
        </div>
    );
};