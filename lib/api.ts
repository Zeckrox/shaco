import { 
    collection, 
    getDocs, 
    getDoc,
    addDoc, 
    updateDoc, 
    deleteDoc, 
    doc, 
    setDoc,
    query, 
    orderBy,
    where
} from 'firebase/firestore';
import { db } from './firebase';

export interface Member {
    id: string;
    name: string;
    role: string;
    email?: string;
    photo_url?: string;
    manager_id?: string | null;
    birthday?: string;
    education?: string;
    work_history?: string;
    description?: string;
    subordinates?: Member[];
}

const membersCollection = collection(db, 'members');
const adminsCollection = collection(db, 'admins');

export const getAdminEmails = async (): Promise<string[]> => {
    const snapshot = await getDocs(adminsCollection);
    return snapshot.docs.map((d) => d.id);
};

export const isAdmin = async (email: string): Promise<boolean> => {
    const d = await getDoc(doc(db, 'admins', email));
    return d.exists();
};

export const addAdmin = async (email: string): Promise<void> => {
    await setDoc(doc(db, 'admins', email), {});
};

export const removeAdmin = async (email: string): Promise<void> => {
    await deleteDoc(doc(db, 'admins', email));
};

export const getMembers = async (): Promise<Member[]> => {
    const q = query(membersCollection, orderBy('name'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    })) as Member[];
};

export const getMemberByEmail = async (email: string): Promise<Member | null> => {
    const q = query(
        membersCollection,
        where('email', '==', email)
    );
    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;
    const doc = snapshot.docs[0];
    return { id: doc.id, ...doc.data() } as Member;
};

export const getTree = async (): Promise<Member[]> => {
    const allMembers = await getMembers();
    const memberMap: { [key: string]: Member } = {};
    
    // Initialize map and subordinates arrays
    allMembers.forEach(member => {
        memberMap[member.id] = { ...member, subordinates: [] };
    });
    
    const rootMembers: Member[] = [];
    
    allMembers.forEach(member => {
        const memberWithSubordinates = memberMap[member.id];
        if (member.manager_id && memberMap[member.manager_id]) {
            memberMap[member.manager_id].subordinates?.push(memberWithSubordinates);
        } else {
            rootMembers.push(memberWithSubordinates);
        }
    });
    
    return rootMembers;
};

export const createMember = async (member: Partial<Member>): Promise<Member> => {
    const docRef = await addDoc(membersCollection, member);
    return {
        id: docRef.id,
        ...member
    } as Member;
};

export const updateMember = async (id: string, member: Partial<Member>): Promise<Member> => {
    const docRef = doc(db, 'members', id);
    // Remove id from the update data if it exists
    const { id: _, ...updateData } = member as any;
    await updateDoc(docRef, updateData);
    return { id, ...member } as Member;
};

export const deleteMember = async (id: string): Promise<void> => {
    const docRef = doc(db, 'members', id);
    await deleteDoc(docRef);
};
