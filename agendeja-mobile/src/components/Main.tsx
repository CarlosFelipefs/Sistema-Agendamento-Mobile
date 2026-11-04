import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator, useWindowDimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { usePreferencias } from '../contexts/PreferenciasContext';
import { useAuth } from '../contexts/AuthContext';
import { useEmpresasProximas } from '../hooks/useEmpresasProximas';
import EmpresaCard from './EmpresaCard';
import Footer from './Footer';
import { obterSaudacao, formatarDataExtenso } from '../utils/formatadores';

export default function Main() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const telaGrande = width >= 768;
  const { cores, idioma } = usePreferencias();
  const { nomeUsuario } = useAuth();
  const { buscarEmpresasProximas, loading, error, empresas, status } = useEmpresasProximas();

  const dataAtual = formatarDataExtenso(idioma);
  const saudacao = obterSaudacao(idioma);

  const handleHabilitarLocalizacao = () => {
    buscarEmpresasProximas();
  };

  const handleEmpresaPress = (empresaId: number) => {
    router.push(`/empresa/${empresaId}`);
  };

  return (
    <ScrollView
      contentContainerStyle={[styles.scrollContent, { backgroundColor: cores.fundo }]}
      style={styles.scrollView}
    >
      <View style={styles.conteudo}>
        {/* Saudação */}
        <Text style={[styles.saudacao, { color: cores.textoPrimario }]}>
          {nomeUsuario ? `${saudacao}, ${nomeUsuario}` : saudacao}
        </Text>

        {/* Data */}
        <Text style={[styles.data, { color: cores.textoSecundario }]}>{dataAtual}</Text>

        {/* Barra de busca */}
        <Pressable
          onPress={() => router.push('/buscar')}
          style={({ pressed }) => [
            styles.barraBusca,
            {
              backgroundColor: cores.superficie,
              borderColor: pressed ? cores.destaque : cores.borda,
            },
          ]}
        >
          <Text style={[styles.textoBusca, { color: cores.textoTerciario }]}>
            {idioma === 'br' ? 'Encontre um estabelecimento' : 'Find a business'}
          </Text>
          <Ionicons name="search" size={20} color={cores.textoTerciario} />
        </Pressable>

        {/* Título "Empresas próximas" */}
        <Text style={[styles.tituloEmpresas, { color: cores.textoPrimario }]}>
          {idioma === 'br' ? 'Empresas próximas' : 'Nearby businesses'}
        </Text>

        {/* Bloco de estados */}
        {status === 'ocioso' || status === 'negada' ? (
          <View style={styles.estadoContainer}>
            <Ionicons name="location-outline" size={48} color={cores.destaque} />
            <Text style={[styles.estadoTexto, { color: cores.textoSecundario }]}>
              {status === 'negada'
                ? idioma === 'br'
                  ? 'Acesso à localização negado. Habilite nas configurações para ver estabelecimentos próximos.'
                  : 'Location access denied. Please enable it in settings to see nearby businesses.'
                : idioma === 'br'
                ? 'Habilite o acesso à localização para encontrarmos os estabelecimentos mais próximos a você =)'
                : 'Enable location access to find the closest businesses to you =)'}
            </Text>
            <Pressable
              onPress={handleHabilitarLocalizacao}
              style={({ pressed }) => [
                styles.botaoLocalizacao,
                {
                  backgroundColor: pressed ? cores.destaqueFoco : cores.destaque,
                },
              ]}
            >
              <Text style={styles.textoBotaoLocalizacao}>
                {idioma === 'br' ? 'Habilitar localização' : 'Enable location'}
              </Text>
            </Pressable>
          </View>
        ) : loading ? (
          <View style={styles.estadoContainer}>
            <ActivityIndicator size="large" color={cores.destaque} />
            <Text style={[styles.estadoTexto, { color: cores.textoSecundario }]}>
              {idioma === 'br' ? 'Carregando empresas próximas...' : 'Loading nearby businesses...'}
            </Text>
          </View>
        ) : error ? (
          <View style={styles.estadoContainer}>
            <Ionicons name="alert-circle-outline" size={48} color={cores.perigo} />
            <Text style={[styles.estadoTexto, { color: cores.textoSecundario }]}>
              {error}
            </Text>
            <Pressable
              onPress={buscarEmpresasProximas}
              style={({ pressed }) => [
                styles.botaoLocalizacao,
                {
                  backgroundColor: pressed ? cores.destaqueFoco : cores.destaque,
                },
              ]}
            >
              <Text style={styles.textoBotaoLocalizacao}>
                {idioma === 'br' ? 'Tentar novamente' : 'Try again'}
              </Text>
            </Pressable>
          </View>
        ) : empresas.length === 0 ? (
          <View style={styles.estadoContainer}>
            <Text style={[styles.estadoTexto, { color: cores.textoSecundario }]}>
              {idioma === 'br'
                ? 'Nenhuma empresa encontrada próxima a você.'
                : 'No businesses found near you.'}
            </Text>
          </View>
        ) : (
          <View
            style={[
              styles.listaEmpresas,
              telaGrande && styles.listaEmpresasGrande,
            ]}
          >
            {empresas.map((empresa) => (
              <EmpresaCard
                key={empresa.id}
                empresa={empresa}
                telaGrande={telaGrande}
                onPress={() => handleEmpresaPress(empresa.id)}
              />
            ))}
          </View>
        )}

        <Footer />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  conteudo: {
    maxWidth: 1000,
    alignSelf: 'center',
    width: '100%',
  },
  saudacao: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  data: {
    fontSize: 14,
    marginBottom: 24,
  },
  barraBusca: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 24,
    minHeight: 44,
  },
  textoBusca: {
    fontSize: 14,
  },
  tituloEmpresas: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  estadoContainer: {
    alignItems: 'center',
    paddingVertical: 32,
    gap: 16,
  },
  estadoTexto: {
    fontSize: 14,
    textAlign: 'center',
  },
  botaoLocalizacao: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 8,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textoBotaoLocalizacao: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  listaEmpresas: {
    gap: 12,
    marginBottom: 24,
  },
  listaEmpresasGrande: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
});
