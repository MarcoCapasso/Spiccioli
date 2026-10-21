//Configurazione pubblica del frontend
const apiUrl = import.meta.env.VITE_API_URL;

if (!apiUrl) {
    throw new Error('Configurazione mancante.')
}

export const config =  {
    apiUrl,
};