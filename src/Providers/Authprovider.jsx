import {
    getAuth,
    onAuthStateChanged,
    signInWithPopup,
    signOut,
    GoogleAuthProvider,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    updateProfile
} from 'firebase/auth';

import { createContext } from 'react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { Navigate } from 'react-router-dom';

import { useEffect } from 'react';
import app from '../Config/Firebase.config';
import axios from 'axios';
import useAxiosSecure from '../Hooks/AxiosSecure/UseAxiosSecure';

const auth = getAuth(app);
export const AuthContext = createContext(null);


const AuthProvider = ({ children }) => {


    const [user, setUser] = useState(null);

    const [loading, setLoading] = useState(true);

    const axiosSecure = useAxiosSecure()

    const createUser = (email, password) => {
        console.log(email, password);
        return createUserWithEmailAndPassword(auth, email, password);

    };

    const signInWithEmail = (email, password) => {
        setLoading(true);
        return signInWithEmailAndPassword(auth, email, password);
    };


    const signOutUser = async () => {
        try {
            await signOut(auth);
            toast.success("sign out successful")
        } catch (error) {
            console.error('Error signing out:', error);
        }
    };



    const signInWithGoogle = async () => {
        const provider = new GoogleAuthProvider();
        try {
            const user = await signInWithPopup(auth, provider);
            // console.log(user);

            toast.success("Successfully Sign With Google");

            // Use the navigate function from useNavigate hook
            //navigate(location?.state ? location.state.from : '/');
            Navigate(location?.state ? location.state.from : '/');
            // navigate(location?.state ? location.state.from : '/');
        } catch (error) {
            //   console.log('Google sign-in error: ', error);
        }
    };

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            if (currentUser) {
                axiosSecure.post('/jwt', {
                    email: currentUser?.email
                })
                    .then(res => {
                        console.log(res.data);
                        setUser(res.data)
                    })
                    .catch(err => {
                        console.log(err);
                    })

            }
            else {
                setUser(null);
            }

            setLoading(false);
            console.log(currentUser);
        });

        return () => unsubscribe();
    }, []);


    const userinfo = {
        user,
        loading,
        createUser,
        signInWithEmail,
        signInWithGoogle,
        signOutUser,
    };
    return (
        <AuthContext.Provider value={userinfo}>
            {children}
        </AuthContext.Provider>
    );
};


export default AuthProvider;