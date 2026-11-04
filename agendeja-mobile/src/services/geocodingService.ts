import { Platform } from 'react-native';

export interface Coordenadas {
  latitude: number;
  longitude: number;
}

export const geocodingService = {
  buscarCoordenadas: async (
    endereco: string,
    cidade: string,
    estado: string,
    cep?: string
  ): Promise<Coordenadas | null> => {
    try {
      const partes = [endereco, cidade, estado, cep, 'Brasil'].filter(Boolean).join(', ');
      const query = encodeURIComponent(partes);
      const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${query}`;

      const headers: Record<string, string> = {
        Accept: 'application/json',
      };

      // Nominatim exige User-Agent. No nativo podemos passar customizado.
      if (Platform.OS !== 'web') {
        headers['User-Agent'] = 'AgendeJa-Mobile/1.0';
      }

      const resposta = await fetch(url, { headers });
      if (!resposta.ok) {
        return null;
      }

      const resultados = await resposta.json();
      if (Array.isArray(resultados) && resultados.length > 0) {
        const item = resultados[0];
        const lat = parseFloat(item.lat);
        const lon = parseFloat(item.lon);
        if (!isNaN(lat) && !isNaN(lon)) {
          return { latitude: lat, longitude: lon };
        }
      }
      return null;
    } catch {
      return null;
    }
  },
};
