// import React, { createContext, useState, useEffect, useContext } from 'react';
// import { getAuth, onAuthStateChanged, signOut, setPersistence, browserLocalPersistence } from 'firebase/auth';
// import { doc, getDoc } from 'firebase/firestore';
// import { db } from '../firebase.config';

// const AuthContext = createContext();

// export const AuthProvider = ({ children }) => {
//   const [user, setUser] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     const auth = getAuth();

//     setPersistence(auth, browserLocalPersistence)
//       .then(() => {
//         const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
//           try {
//             if (firebaseUser) {
//               const userDocRef = doc(db, 'users', firebaseUser.email);
//               const userDoc = await getDoc(userDocRef);
              
//               let userData;
//               if (userDoc.exists()) {
//                 userData = {
//                   ...userDoc.data(),
//                   email: firebaseUser.email,
//                   emailVerified: firebaseUser.emailVerified,
//                 };
//               } else {
//                 console.log("No user document found!");
//                 userData = {
//                   email: firebaseUser.email,
//                   emailVerified: firebaseUser.emailVerified,
//                 };
//               }

//               setUser(userData);
//               localStorage.setItem('user', JSON.stringify(userData));
//             } else {
//               setUser(null);
//               localStorage.removeItem('user');
//             }
//           } catch (error) {
//             console.error("Error in auth state change:", error);
//             setError(error.message);
//             setUser(null);
//             localStorage.removeItem('user');
//           } finally {
//             setLoading(false);
//           }
//         });

//         return () => unsubscribe();
//       })
//       .catch((error) => {
//         console.error("Error setting auth persistence:", error);
//         setError("Failed to set auth persistence. Please try again.");
//         setLoading(false);
//       });
//   }, []);

//   const logout = async () => {
//     const auth = getAuth();
//     try {
//       await signOut(auth);
//       setUser(null);
//       localStorage.removeItem('user');
//     } catch (error) {
//       console.error("Error signing out:", error);
//       setError("Failed to sign out. Please try again.");
//       throw error;
//     }
//   };

//   const clearError = () => setError(null);

//   return (
//     <AuthContext.Provider value={{ user, loading, error, logout, clearError }}>
//       {!loading && children}
//     </AuthContext.Provider>
//   );
// };

// export const useAuth = () => useContext(AuthContext);



import React, { createContext, useState, useContext, useEffect } from 'react';
import { getAuth, onAuthStateChanged, signOut, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase.config';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const auth = getAuth();

    setPersistence(auth, browserLocalPersistence)
      .then(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
          try {
            if (firebaseUser && firebaseUser.emailVerified) {
              const userDocRef = doc(db, 'users', firebaseUser.email);
              const userDoc = await getDoc(userDocRef);
              
              let userData;
              if (userDoc.exists()) {
                userData = {
                  ...userDoc.data(),
                  uid: firebaseUser.uid,
                  email: firebaseUser.email,
                  emailVerified: firebaseUser.emailVerified,
                };
              } else {
                console.log("No user document found!");
                userData = {
                  uid: firebaseUser.uid,
                  email: firebaseUser.email,
                  emailVerified: firebaseUser.emailVerified,
                };
              }

              setUser(userData);
              localStorage.setItem('user', JSON.stringify(userData));
            } else {
              setUser(null);
              localStorage.removeItem('user');
            }
          } catch (error) {
            console.error("Error in auth state change:", error);
            setError(error.message);
            setUser(null);
            localStorage.removeItem('user');
          } finally {
            setLoading(false);
          }
        });

        return () => unsubscribe();
      })
      .catch((error) => {
        console.error("Error setting auth persistence:", error);
        setError("Failed to set auth persistence. Please try again.");
        setLoading(false);
      });
  }, []);

  const login = async (firebaseUser) => {
    if (firebaseUser && firebaseUser.emailVerified) {
      const userDocRef = doc(db, 'users', firebaseUser.email);
      const userDoc = await getDoc(userDocRef);
      
      let userData;
      if (userDoc.exists()) {
        userData = {
          ...userDoc.data(),
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          emailVerified: firebaseUser.emailVerified,
        };
      } else {
        userData = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          emailVerified: firebaseUser.emailVerified,
        };
      }

      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
    }
  };

  const logout = async () => {
    const auth = getAuth();
    try {
      await signOut(auth);
      setUser(null);
      localStorage.removeItem('user');
    } catch (error) {
      console.error("Error signing out:", error);
      setError("Failed to sign out. Please try again.");
      throw error;
    }
  };

  const clearError = () => setError(null);

  const value = {
    user,
    login,
    logout,
    loading,
    error,
    clearError
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};