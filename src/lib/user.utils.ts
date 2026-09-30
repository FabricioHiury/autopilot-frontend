import api from "@/utils/classes/api";

export async function loadStoreInfo() {
    const [response, error] = await api.get("/loja");
    return response.data
}

export function getUserStorageId() {
    try {
        const userStorage = localStorage.getItem("usuario");
        let jsonUser = JSON.parse(userStorage ?? "{}");
        const id = jsonUser.id;

        if (!id) return null;

        return id
    } catch (error) {
        throw new Error("Falha ao obter o ID do usuário");
    }
}

export function getStoreStorageId() {
    try {
        const userStorage = localStorage.getItem("usuario");
        let jsonUser = JSON.parse(userStorage ?? "{}");
        const idLoja = jsonUser.idLoja;

        if (!idLoja) return null;

        return idLoja
    } catch (error) {
        throw new Error("Falha ao obter o ID da loja");
    }
}