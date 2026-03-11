import { 
    collection, 
    getDocs, 
    addDoc, 
    updateDoc, 
    deleteDoc, 
    doc, 
    query, 
    orderBy 
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
    subordinates?: Member[];
}

const membersCollection = collection(db, 'members');

export const getMembers = async (): Promise<Member[]> => {
    const q = query(membersCollection, orderBy('name'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    })) as Member[];
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
