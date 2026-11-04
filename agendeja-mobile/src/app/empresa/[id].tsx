import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Linking,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { usePreferencias } from '../../contexts/PreferenciasContext';
import { useAuth } from '../../contexts/AuthContext';
import { useEmpresaPorId } from '../../hooks/useEmpresaPorId';
import { formatarPreco, formatarDuracao, somenteDigitos } from '../../utils/formatadores';
import { confirmar, mostrarMensagem } from '../../utils/dialogos';
import SeletorAbas from '../../components/SeletorAbas';
import EstadoTela from '../../components/EstadoTela';
import Botao from '../../components/Botao';
import Footer from '../../components/Footer';

export default function EmpresaDetalheScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { cores, t } = usePreferencias();
  const { logado } = useAuth();

  const empresaId = Number(id);
  const { empresa, carregando, erro, recarregar } = useEmpresaPorId(
    isNaN(empresaId) ? null : empresaId
  );

  const [abaAtiva, setAbaAtiva] = useState<'servicos' | 'profissionais'>('servicos');

  if (isNaN(empresaId)) {
    return (
      <View style={[styles.containerCentralizado, { backgroundColor: cores.fundo }]}>
        <EstadoTela
          icone="alert-circle-outline"
          texto={t('Empresa não encontrada', 'Business not found')}
          acao={{
            titulo: t('Voltar', 'Go back'),
            onPress: () => router.back(),
          }}
        />
      </View>
    );
  }

  if (carregando) {
    return (
      <View style={[styles.containerCentralizado, { backgroundColor: cores.fundo }]}>
        <EstadoTela
          carregando
          texto={t('Carregando informações da empresa...', 'Loading business details...')}
        />
      </View>
    );
  }

  if (erro || !empresa) {
    return (
      <View style={[styles.containerCentralizado, { backgroundColor: cores.fundo }]}>
        <EstadoTela
          icone="alert-circle-outline"
          texto={erro || t('Empresa não encontrada', 'Business not found')}
          acao={{
            titulo: t('Tentar novamente', 'Try again'),
            onPress: recarregar,
          }}
        />
      </View>
    );
  }

  const handleAbrirMapa = async () => {
    const enderecoCompleto = [
      empresa.endereco,
      empresa.cidade,
      empresa.estado,
      empresa.cep,
    ]
      .filter(Boolean)
      .join(', ');

    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      enderecoCompleto
    )}`;

    try {
      await Linking.openURL(url);
    } catch {
      await mostrarMensagem(
        t('Erro', 'Error'),
        t('Não foi possível abrir o mapa.', 'Could not open map.')
      );
    }
  };

  const handleLigar = async () => {
    if (!empresa.telefone) return;
    const digitos = somenteDigitos(empresa.telefone);
    const url = `tel:${digitos}`;
    try {
      await Linking.openURL(url);
    } catch {
      await mostrarMensagem(
        t('Erro', 'Error'),
        t('Não foi possível realizar a chamada telefônica.', 'Could not initiate phone call.')
      );
    }
  };

  const handleAgendarServico = async (servicoId: number) => {
    if (!logado) {
      const querFazerLogin = await confirmar(
        t('Login necessário', 'Login required'),
        t(
          'Você precisa estar logado para agendar este serviço.',
          'You need to be logged in to book this service.'
        ),
        {
          confirmar: t('Entrar', 'Sign In'),
          cancelar: t('Cancelar', 'Cancel'),
        }
      );
      if (querFazerLogin) {
        router.push('/login');
      }
      return;
    }

    router.push({
      pathname: '/agendar/[empresaId]',
      params: { empresaId: empresa.id, servicoId },
    });
  };

  const handleAgendarAgora = () => {
    setAbaAtiva('servicos');
  };

  const servicos = empresa.servicos || [];
  const profissionais = empresa.profissionais || [];

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: cores.fundo }]}
      contentContainerStyle={styles.scrollContent}
    >
      <View style={styles.conteudo}>
        {/* Cabeçalho da Empresa */}
        <View style={[styles.cabecalhoCard, { backgroundColor: cores.cartao, borderColor: cores.borda }]}>
          <View
            style={[
              styles.avatarPlaceholder,
              { backgroundColor: cores.superficie, borderColor: cores.bordaImagem },
            ]}
          >
            <Ionicons name="business" size={40} color={cores.textoTerciario} />
          </View>

          <Text style={[styles.nome, { color: cores.textoPrimario }]}>{empresa.nome}</Text>

          {empresa.categoria ? (
            <View style={[styles.tagCategoria, { backgroundColor: cores.superficie, borderColor: cores.borda }]}>
              <Text style={[styles.categoriaTexto, { color: cores.destaque }]}>
                {empresa.categoria}
              </Text>
            </View>
          ) : null}

          <Botao
            titulo={t('Agendar agora', 'Book now')}
            onPress={handleAgendarAgora}
            variante="alerta"
            style={styles.botaoAgendarAgora}
          />
        </View>

        {/* Abas Serviços / Profissionais */}
        <SeletorAbas
          abas={[
            { id: 'servicos', titulo: t('Serviços', 'Services') },
            { id: 'profissionais', titulo: t('Profissionais', 'Staff') },
          ]}
          ativa={abaAtiva}
          aoMudar={(id) => setAbaAtiva(id as 'servicos' | 'profissionais')}
        />

        {abaAtiva === 'servicos' ? (
          <View style={styles.lista}>
            {servicos.length === 0 ? (
              <Text style={[styles.textoVazio, { color: cores.textoSecundario }]}>
                {t('Nenhum serviço disponível', 'No services available')}
              </Text>
            ) : (
              servicos.map((servico) => (
                <View
                  key={servico.id}
                  style={[
                    styles.itemCard,
                    { backgroundColor: cores.cartao, borderColor: cores.borda },
                  ]}
                >
                  <View style={styles.itemInfo}>
                    <Text style={[styles.itemTitulo, { color: cores.textoPrimario }]}>
                      {servico.nome}
                    </Text>
                    <Text style={[styles.itemSubtitulo, { color: cores.textoSecundario }]}>
                      {formatarPreco(servico.preco)} • {formatarDuracao(servico.duracaoEmMinutos)}
                    </Text>
                  </View>

                  <Botao
                    titulo={t('Agendar', 'Book')}
                    onPress={() => handleAgendarServico(servico.id)}
                    variante="primario"
                    style={styles.botaoItem}
                  />
                </View>
              ))
            )}
          </View>
        ) : (
          <View style={styles.lista}>
            {profissionais.length === 0 ? (
              <Text style={[styles.textoVazio, { color: cores.textoSecundario }]}>
                {t('Nenhum profissional cadastrado', 'No staff registered')}
              </Text>
            ) : (
              profissionais.map((profissional) => (
                <View
                  key={profissional.id}
                  style={[
                    styles.itemCard,
                    { backgroundColor: cores.cartao, borderColor: cores.borda },
                  ]}
                >
                  <View
                    style={[
                      styles.avatarProfissional,
                      { backgroundColor: cores.superficie, borderColor: cores.bordaImagem },
                    ]}
                  >
                    <Ionicons name="person" size={20} color={cores.textoTerciario} />
                  </View>
                  <View style={styles.itemInfo}>
                    <Text style={[styles.itemTitulo, { color: cores.textoPrimario }]}>
                      {profissional.nome}
                    </Text>
                    <Text style={[styles.itemSubtitulo, { color: cores.textoSecundario }]}>
                      {profissional.especialidade}
                    </Text>
                  </View>
                </View>
              ))
            )}
          </View>
        )}

        {/* Informações de Contato e Endereço */}
        <View style={[styles.cardContato, { backgroundColor: cores.cartao, borderColor: cores.borda }]}>
          <Text style={[styles.secaoTitulo, { color: cores.textoPrimario }]}>
            {t('Informações do local', 'Location info')}
          </Text>

          <Pressable
            onPress={handleAbrirMapa}
            style={({ pressed }) => [
              styles.linhaContato,
              { backgroundColor: pressed ? cores.superficie : 'transparent' },
            ]}
          >
            <Ionicons name="location-outline" size={22} color={cores.destaque} style={styles.iconeLinha} />
            <View style={styles.textoLinhaContainer}>
              <Text style={[styles.textoPrincipalLinha, { color: cores.textoPrimario }]}>
                {empresa.endereco}
              </Text>
              <Text style={[styles.textoSecundarioLinha, { color: cores.textoSecundario }]}>
                {[empresa.cidade, empresa.estado, empresa.cep].filter(Boolean).join(' - ')}
              </Text>
              <Text style={[styles.linkAcao, { color: cores.destaque }]}>
                {t('Abrir no Google Maps', 'Open in Google Maps')} ↗
              </Text>
            </View>
          </Pressable>

          {empresa.telefone ? (
            <Pressable
              onPress={handleLigar}
              style={({ pressed }) => [
                styles.linhaContato,
                { backgroundColor: pressed ? cores.superficie : 'transparent' },
              ]}
            >
              <Ionicons name="call-outline" size={22} color={cores.sucesso} style={styles.iconeLinha} />
              <View style={styles.textoLinhaContainer}>
                <Text style={[styles.textoPrincipalLinha, { color: cores.textoPrimario }]}>
                  {empresa.telefone}
                </Text>
                <Text style={[styles.linkAcao, { color: cores.sucesso }]}>
                  {t('Ligar para o estabelecimento', 'Call business')}
                </Text>
              </View>
            </Pressable>
          ) : null}
        </View>

        <Footer />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  containerCentralizado: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  conteudo: {
    maxWidth: 800,
    width: '100%',
    alignSelf: 'center',
  },
  cabecalhoCard: {
    alignItems: 'center',
    padding: 24,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 20,
    gap: 8,
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  nome: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  tagCategoria: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
    borderWidth: 1,
  },
  categoriaTexto: {
    fontSize: 13,
    fontWeight: '600',
  },
  botaoAgendarAgora: {
    marginTop: 12,
    minWidth: 160,
  },
  lista: {
    gap: 12,
    marginBottom: 24,
  },
  textoVazio: {
    fontSize: 14,
    textAlign: 'center',
    paddingVertical: 20,
  },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 10,
    borderWidth: 1,
    gap: 12,
  },
  avatarProfissional: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemInfo: {
    flex: 1,
    gap: 4,
  },
  itemTitulo: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  itemSubtitulo: {
    fontSize: 14,
  },
  botaoItem: {
    minHeight: 40,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  cardContato: {
    padding: 18,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 24,
    gap: 12,
  },
  secaoTitulo: {
    fontSize: 17,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  linhaContato: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 10,
    borderRadius: 8,
    minHeight: 44,
  },
  iconeLinha: {
    marginRight: 12,
    marginTop: 2,
  },
  textoLinhaContainer: {
    flex: 1,
    gap: 2,
  },
  textoPrincipalLinha: {
    fontSize: 15,
    fontWeight: '500',
  },
  textoSecundarioLinha: {
    fontSize: 13,
  },
  linkAcao: {
    fontSize: 13,
    fontWeight: '600',
    marginTop: 2,
  },
});
