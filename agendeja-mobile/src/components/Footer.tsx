import React from 'react';
import { View, Text, StyleSheet, Pressable, useWindowDimensions, Linking } from 'react-native';
import { useRouter, Href } from 'expo-router';
import { FontAwesome5 } from '@expo/vector-icons';
import { usePreferencias } from '../contexts/PreferenciasContext';
import { mostrarMensagem } from '../utils/dialogos';

export default function Footer() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const telaGrande = width >= 768;
  const { cores, idioma } = usePreferencias();

  const handleLink = (rota: Href) => {
    router.push(rota);
  };

  const handleAlert = async (titulo: string, mensagem: string) => {
    await mostrarMensagem(titulo, mensagem);
  };

  const handleSocialLink = async (url: string) => {
    try {
      await Linking.openURL(url);
    } catch {
      await mostrarMensagem('Erro', 'Não foi possível abrir o link.');
    }
  };

  const handleGestor = () => {
    // Ao concluir a Fase 9, rota /gestor; já configurada para navegação tipada
    router.push('/gestor' as unknown as Href);
  };

  const anoAtual = new Date().getFullYear();

  return (
    <View style={[styles.container, { backgroundColor: cores.fundo }]}>
      <View
        style={[
          styles.conteudo,
          telaGrande && styles.conteudoGrande,
          { borderColor: cores.borda },
        ]}
      >
        {/* Marca */}
        <View style={[styles.secao, telaGrande && styles.secaoGrande]}>
          <Text style={[styles.marca, { color: cores.destaque }]}>AgendeJá</Text>
          <Text style={[styles.descricao, { color: cores.textoSecundario }]}>
            {idioma === 'br'
              ? 'Uma nova experiência para uma antiga tradição.'
              : 'A new experience for an old tradition.'}
          </Text>
          <View style={styles.iconesSociais}>
            <Pressable
              onPress={() => handleSocialLink('https://facebook.com')}
              style={({ pressed }) => [
                styles.iconeSocial,
                { opacity: pressed ? 0.7 : 1 },
              ]}
              hitSlop={10}
              accessibilityLabel="Facebook"
            >
              <FontAwesome5 name="facebook" size={20} color={cores.textoSecundario} />
            </Pressable>
            <Pressable
              onPress={() => handleSocialLink('https://instagram.com')}
              style={({ pressed }) => [
                styles.iconeSocial,
                { opacity: pressed ? 0.7 : 1 },
              ]}
              hitSlop={10}
              accessibilityLabel="Instagram"
            >
              <FontAwesome5 name="instagram" size={20} color={cores.textoSecundario} />
            </Pressable>
            <Pressable
              onPress={() => handleSocialLink('https://youtube.com')}
              style={({ pressed }) => [
                styles.iconeSocial,
                { opacity: pressed ? 0.7 : 1 },
              ]}
              hitSlop={10}
              accessibilityLabel="YouTube"
            >
              <FontAwesome5 name="youtube" size={20} color={cores.textoSecundario} />
            </Pressable>
            <Pressable
              onPress={() => handleSocialLink('https://twitter.com')}
              style={({ pressed }) => [
                styles.iconeSocial,
                { opacity: pressed ? 0.7 : 1 },
              ]}
              hitSlop={10}
              accessibilityLabel="Twitter"
            >
              <FontAwesome5 name="twitter" size={20} color={cores.textoSecundario} />
            </Pressable>
          </View>
        </View>

        {/* Acesso rápido */}
        <View style={[styles.secao, telaGrande && styles.secaoGrande]}>
          <Text style={[styles.tituloSecao, { color: cores.textoPrimario }]}>
            {idioma === 'br' ? 'Acesso rápido' : 'Quick access'}
          </Text>
          <Pressable
            onPress={() => handleLink('/')}
            style={({ pressed }) => [
              styles.link,
              { backgroundColor: pressed ? cores.botaoIconePressionado : 'transparent' },
            ]}
            hitSlop={10}
          >
            <Text style={[styles.textoLink, { color: cores.textoSecundario }]}>
              {idioma === 'br' ? 'Início' : 'Home'}
            </Text>
          </Pressable>
          <Pressable
            onPress={() => handleLink('/buscar')}
            style={({ pressed }) => [
              styles.link,
              { backgroundColor: pressed ? cores.botaoIconePressionado : 'transparent' },
            ]}
            hitSlop={10}
          >
            <Text style={[styles.textoLink, { color: cores.textoSecundario }]}>
              {idioma === 'br' ? 'Encontrar estabelecimentos' : 'Find businesses'}
            </Text>
          </Pressable>
          <Pressable
            onPress={() => handleLink('/agendamentos')}
            style={({ pressed }) => [
              styles.link,
              { backgroundColor: pressed ? cores.botaoIconePressionado : 'transparent' },
            ]}
            hitSlop={10}
          >
            <Text style={[styles.textoLink, { color: cores.textoSecundario }]}>
              {idioma === 'br' ? 'Meus agendamentos' : 'My appointments'}
            </Text>
          </Pressable>
        </View>

        {/* Mais */}
        <View style={[styles.secao, telaGrande && styles.secaoGrande]}>
          <Text style={[styles.tituloSecao, { color: cores.textoPrimario }]}>
            {idioma === 'br' ? 'Mais' : 'More'}
          </Text>
          <Pressable
            onPress={() =>
              handleAlert(
                idioma === 'br' ? 'Em breve' : 'Coming soon',
                idioma === 'br'
                  ? 'Página de termos de uso será implementada em breve.'
                  : 'Terms of use page will be implemented soon.'
              )
            }
            style={({ pressed }) => [
              styles.link,
              { backgroundColor: pressed ? cores.botaoIconePressionado : 'transparent' },
            ]}
            hitSlop={10}
          >
            <Text style={[styles.textoLink, { color: cores.textoSecundario }]}>
              {idioma === 'br' ? 'Termos de uso' : 'Terms of use'}
            </Text>
          </Pressable>
          <Pressable
            onPress={() =>
              handleAlert(
                idioma === 'br' ? 'Em breve' : 'Coming soon',
                idioma === 'br'
                  ? 'Preferências de cookies serão implementadas em breve.'
                  : 'Cookie preferences will be implemented soon.'
              )
            }
            style={({ pressed }) => [
              styles.link,
              { backgroundColor: pressed ? cores.botaoIconePressionado : 'transparent' },
            ]}
            hitSlop={10}
          >
            <Text style={[styles.textoLink, { color: cores.textoSecundario }]}>
              {idioma === 'br' ? 'Preferências de cookies' : 'Cookie preferences'}
            </Text>
          </Pressable>
        </View>

        {/* É um gestor? */}
        <View style={[styles.secao, telaGrande && styles.secaoGrande]}>
          <Text style={[styles.tituloSecao, { color: cores.textoPrimario }]}>
            {idioma === 'br' ? 'É um gestor?' : 'Are you a manager?'}
          </Text>
          <Text style={[styles.descricaoGestor, { color: cores.textoSecundario }]}>
            {idioma === 'br'
              ? 'Cadastre seu estabelecimento e comece a receber agendamentos online.'
              : 'Register your business and start receiving online appointments.'}
          </Text>
          <Pressable
            onPress={handleGestor}
            style={({ pressed }) => [
              styles.botaoSaibaMais,
              {
                backgroundColor: pressed ? cores.destaqueFoco : cores.destaque,
              },
            ]}
            hitSlop={10}
          >
            <Text style={styles.textoSaibaMais}>
              {idioma === 'br' ? 'Saiba mais' : 'Learn more'}
            </Text>
          </Pressable>
        </View>
      </View>

      {/* Linha final */}
      <View style={[styles.linhaFinal, { borderTopColor: cores.borda }]}>
        <Text style={[styles.copyright, { color: cores.textoTerciario }]}>
          © {anoAtual} StarApp Sistemas. {idioma === 'br' ? 'Todos os direitos reservados.' : 'All rights reserved.'}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 32,
    paddingBottom: 24,
  },
  conteudo: {
    paddingHorizontal: 16,
    flexDirection: 'column',
    gap: 24,
  },
  conteudoGrande: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    maxWidth: 1000,
    alignSelf: 'center',
    width: '100%',
  },
  secao: {
    gap: 12,
  },
  secaoGrande: {
    flex: 1,
    minWidth: '45%',
  },
  marca: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  descricao: {
    fontSize: 14,
    marginBottom: 12,
  },
  iconesSociais: {
    flexDirection: 'row',
    gap: 16,
  },
  iconeSocial: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tituloSecao: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  link: {
    paddingVertical: 8,
    minHeight: 44,
    justifyContent: 'center',
  },
  textoLink: {
    fontSize: 14,
  },
  descricaoGestor: {
    fontSize: 14,
    marginBottom: 12,
  },
  botaoSaibaMais: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 6,
    alignSelf: 'flex-start',
    minHeight: 44,
    justifyContent: 'center',
  },
  textoSaibaMais: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  linhaFinal: {
    borderTopWidth: 1,
    marginTop: 32,
    paddingTop: 16,
    paddingHorizontal: 16,
  },
  copyright: {
    fontSize: 12,
    textAlign: 'center',
  },
});
