import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { coresEscuro, coresClaro, Cores } from '../constants/cores';

type Tema = 'dark' | 'light';
type Idioma = 'br' | 'en';

interface PreferenciasContextData {
  tema: Tema;
  idioma: Idioma;
  cores: Cores;
  alternarTema: () => void;
  alternarIdioma: () => void;
  t: (br: string, en: string) => string;
  carregando: boolean;
}

const PreferenciasContext = createContext<PreferenciasContextData>({} as PreferenciasContextData);

export function PreferenciasProvider({ children }: { children: React.ReactNode }) {
  const [tema, setTema] = useState<Tema>('dark');
  const [idioma, setIdioma] = useState<Idioma>('br');
  const [carregando, setCarregando] = useState(true);

  const carregarPreferencias = async () => {
    try {
      const temaSalvo = await AsyncStorage.getItem('theme');
      const idiomaSalvo = await AsyncStorage.getItem('lang');
      
      if (temaSalvo === 'dark' || temaSalvo === 'light') {
        setTema(temaSalvo);
      }
      if (idiomaSalvo === 'br' || idiomaSalvo === 'en') {
        setIdioma(idiomaSalvo);
      }
    } catch (error) {
      console.error('Erro ao carregar preferências:', error);
    } finally {
      setCarregando(false);
    }
  };

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    carregarPreferencias();
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  const alternarTema = async () => {
    const novoTema: Tema = tema === 'dark' ? 'light' : 'dark';
    setTema(novoTema);
    try {
      await AsyncStorage.setItem('theme', novoTema);
    } catch (error) {
      console.error('Erro ao salvar tema:', error);
    }
  };

  const alternarIdioma = async () => {
    const novoIdioma: Idioma = idioma === 'br' ? 'en' : 'br';
    setIdioma(novoIdioma);
    try {
      await AsyncStorage.setItem('lang', novoIdioma);
    } catch (error) {
      console.error('Erro ao salvar idioma:', error);
    }
  };

  const cores = tema === 'dark' ? coresEscuro : coresClaro;

  const t = (br: string, en: string) => (idioma === 'en' ? en : br);

  return (
    <PreferenciasContext.Provider
      value={{ tema, idioma, cores, alternarTema, alternarIdioma, t, carregando }}
    >
      {children}
    </PreferenciasContext.Provider>
  );
}

export function usePreferencias() {
  const context = useContext(PreferenciasContext);
  if (!context) {
    throw new Error('usePreferencias deve ser usado dentro de PreferenciasProvider');
  }
  return context;
}
