// app/user/UserProfile.tsx
import React from 'react';
import styles from './UserProfile.module.css';

interface UserProfileProps {
    username: string;
}

const UserProfile: React.FC<UserProfileProps> = ({ username }) => {
    return (
        <div className={styles.profileContainer}>
            <div className={styles.profileName}>{username}</div>
            <div className={styles.profileImage}>
                <span></span>
            </div>
            <button className={styles.editButton}>Edit profile</button>
        </div>
    );
};

export default UserProfile;