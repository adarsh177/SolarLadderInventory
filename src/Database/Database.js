import Firebase from 'firebase'

export async function GetInventory(){
    const result = await Firebase.app().firestore().collection("Inventory").get()
    return result.docs.map(item => {
        return {
            ...item.data(),
            docId: item.id
        }
    })
}

export async function GetConfig(){
    const result = await Firebase.app().firestore().doc("Config/ROysqlg3YPeFRWhI25Hf").get()
    return result.data()
}

export async function AdjustStock(itemId, updatedValue){
    const result = await Firebase.app().firestore().doc(`Inventory/${itemId}`).update({
        stock: updatedValue
    })

    return Promise.resolve()
}

export async function AddItemToInventory(data){
    const result = await Firebase.app().firestore().collection('Inventory').doc().set(data)
    return Promise.resolve()
}

export async function UpdateInventoryItem(docId, data){
    const result = await Firebase.app().firestore().collection('Inventory').doc(docId).update(data)
    return Promise.resolve()
}

export async function DeleteInventoryItem(docId){
    const result = await Firebase.app().firestore().collection('Inventory').doc(docId).delete()
    return Promise.resolve()
}