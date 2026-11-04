import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  Pressable,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { usePreferencias } from '../../contexts/PreferenciasContext';
import { useExigirLogin } from '../../hooks/useExigirLogin';
import { empresaService } from '../../services/empresaService';
import { Empresa } from '../../types/empresa';
import EstadoTela from '../../components/EstadoTela';
import Botao from '../../components/Botao';
import Footer from '../../components/Footer';

export default function GestorEmpresasScreen() {
  const router = useRouter();
  const { cores, t } = usePreferencias();
  const { logado, carregando: checandoAuth } = useExigirLogin();

  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [carregando, setCarregando] = useState(false);
  const [recarregando, setRecarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const carregarEmpresas = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRecarregando(true);
    } else {
      setCarregando(true);
    }
    setErro(null);

    try {
      const lista = await empresaService.listarTodas();
      setEmpresas(Array.isArray(lista) ? lista : []);
    } catch {
      setErro(t('Não foi possível carregar as empresas.', 'Unable to load businesses.'));
    } finally {
      setCarregando(false);
      setRecarregando(false);
    }
  }, [t]);

  useFocusEffect(
    useCallback(() => {
      if (logado) {
        carregarEmpresas();
      }
    }, [logado, carregarEmpresas])
  );

  if (checandoAuth || !logado) {
    return null;
  }

  return (
    <View style={[styles.container, { backgroundColor: cores.fundo }]}>
      <FlatList
        data={empresas}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={recarregando}
            onRefresh={() => carregarEmpresas(true)}
            colors={[cores.destaque]}
            tintColor={cores.destaque}
          />
        }
        ListHeaderComponent={
          <View style={styles.cabecalho}>
            <View style={styles.topoLinha}>
              <Text style={[styles.titulo, { color: cores.textoPrimario }]}>
                {t('Empresas Cadastradas', 'Registered Businesses')}
              </Text>
              <Botao
                titulo={t('+ Cadastrar', '+ New')}
                onPress={() => router.push('/gestor')}
                variante="primario"
                style={styles.botaoNovo}
              />
            </View>
            <Text style={[styles.subtitulo, { color: cores.textoSecundario }]}>
              {t(
                'Selecione uma empresa para gerenciar dados, serviços e equipe.',
                'Select a business to manage info, services and staff.'
              )}
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <Pressable
            onPress={() =>
              router.push({
                pathname: '/gestor/empresa/[id]',
                params: { id: item.id },
              })
            }
            style={({ pressed }) => [
              styles.cardEmpresa,
              {
                backgroundColor: cores.cartao,
                borderColor: cores.borda,
                opacity: pressed ? 0.8 : 1,
              },
            ]}
          >
            <View
              style={[
                styles.iconeBox,
                { backgroundColor: cores.superficie, borderColor: cores.bordaImagem },
              ]}
            >
              <Ionicons name="business" size={24} color={cores.textoTerciario} />
            </View>

            <View style={styles.infoEmpresa}>
              <Text style={[styles.nomeEmpresa, { color: cores.textoPrimario }]} numberOfLines={1}>
                {item.nome}
              </Text>
              <Text style={[styles.enderecoEmpresa, { color: cores.textoSecundario }]} numberOfLines={1}>
                {[item.endereco, item.cidade, item.estado].filter(Boolean).join(', ')}
              </Text>
              <View style={styles.linhaTags}>
                {item.categoria ? (
                  <Text style={[styles.tag, { color: cores.destaque }]}>
                    🏷️ {item.categoria}
                  </Text>
                ) : null}
                {item.telefone ? (
                  <Text style={[styles.tag, { color: cores.textoTerciario }]}>
                    📞 {item.telefone}
                  </Text>
                ) : null}
              </View>
            </View>

            <Ionicons name="chevron-forward" size={20} color={cores.textoTerciario} />
          </Pressable>
        )}
        ListEmptyComponent={
          carregando ? (
            <EstadoTela
              carregando
              texto={t('Carregando empresas...', 'Loading businesses...')}
            />
          ) : erro ? (
            <EstadoTela
              icone="alert-circle-outline"
              texto={erro}
              acao={{
                titulo: t('Tentar novamente', 'Try again'),
                onPress: () => carregarEmpresas(),
              }}
            />
          ) : (
            <EstadoTela
              icone="business-outline"
              texto={t('Nenhuma empresa cadastrada', 'No businesses registered')}
              subtexto={t(
                'Cadastre o primeiro estabelecimento para começar.',
                'Register the first business to get started.'
              )}
              acao={{
                titulo: t('Cadastrar Empresa', 'Register Business'),
                onPress: () => router.push('/gestor'),
              }}
            />
          )
        }
        ListFooterComponent={<Footer />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
    maxWidth: 800,
    width: '100%',
    alignSelf: 'center',
  },
  cabecalho: {
    marginBottom: 16,
    gap: 4,
  },
  topoLinha: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  titulo: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  subtitulo: {
    fontSize: 14,
  },
  botaoNovo: {
    minHeight: 38,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  cardEmpresa: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 12,
    gap: 12,
    minHeight: 44,
  },
  iconeBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoEmpresa: {
    flex: 1,
    gap: 4,
  },
  nomeEmpresa: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  enderecoEmpresa: {
    fontSize: 13,
  },
  linhaTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 2,
  },
  tag: {
    fontSize: 12,
  },
});
