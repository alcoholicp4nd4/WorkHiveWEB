import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { collection, addDoc, getDocs, query, where, doc, updateDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { auth, db, storage } from './firebaseConfig';
const AsyncStorage = {
  setItem: async (key, value) => localStorage.setItem(key, value),
  getItem: async (key) => localStorage.getItem(key),
  removeItem: async (key) => localStorage.removeItem(key),
};
const Platform = { OS: "web" };

// ✅ Register user
export const registerUser = async (username, email, password) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // 🔹 Add default role and provider status
    const userData = {
      uid: user.uid,
      username: username,
      email: email,
      isProvider: false,
      role: "user", // 👈 Default role
    };

    await addDoc(collection(db, "users"), userData);

    if (Platform.OS === "web") {
      localStorage.setItem("loggedInUser", JSON.stringify(userData));
    } else {
      await AsyncStorage.setItem("loggedInUser", JSON.stringify(userData));
    }

    return { success: true, user: userData };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// ✅ Login user
export const loginUser = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    const q = query(collection(db, "users"), where("uid", "==", user.uid));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const userData = querySnapshot.docs[0].data();

      if (Platform.OS === "web") {
        localStorage.setItem("loggedInUser", JSON.stringify(userData));
      } else {
        await AsyncStorage.setItem("loggedInUser", JSON.stringify(userData));
      }

      // ✅ Check if admin and return special flag
      if (userData.role === 'admin') {
        return { success: true, user: userData, isAdmin: true };
      }

      return { success: true, user: userData };
    }

    return { success: false, error: "User not found in Firestore" };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// ✅ Get current user
export const getCurrentUser = async () => {
  try {
    const storedUser = Platform.OS === "web"
      ? localStorage.getItem("loggedInUser")
      : await AsyncStorage.getItem("loggedInUser");

    return storedUser ? JSON.parse(storedUser) : null;
  } catch (error) {
    console.error("❌ Error fetching user:", error);
    return null;
  }
};

// ✅ Logout
export const logoutUser = async () => {
  await signOut(auth);
  if (Platform.OS === "web") {
    localStorage.removeItem("loggedInUser");
  } else {
    await AsyncStorage.removeItem("loggedInUser");
  }
};

// ✅ Promote user to provider
export const updateUserToProvider = async (uid) => {
  const userRef = doc(db, "users", uid);
  await updateDoc(userRef, { isProvider: true });
};
// ✅ Upload profile image and return the download URL
export const uploadProfileImage = async (uid, imageFile) => {
  try {
    const storageRef = ref(storage, `profileImages/${uid}`);
    await uploadBytes(storageRef, imageFile);
    const downloadURL = await getDownloadURL(storageRef);
    return { success: true, url: downloadURL };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// ✅ Update user's profile image URL in Firestore
export const updateUserProfileImage = async (uid, imageUrl) => {
  try {
    const userRef = doc(db, "users", uid);
    await updateDoc(userRef, { profileImage: imageUrl });
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

