import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { ArrowRight, FileCheck, Shield, Clock, Car, CheckCircle2 } from 'lucide-react';

const HomePage = () => {
  const features = [
    {
      icon: FileCheck,
      title: 'Submissão Fácil',
      description: 'Carregue os seus documentos de forma simples e segura.'
    },
    {
      icon: Clock,
      title: 'Análise Rápida',
      description: 'Acompanhe o estado do seu processo em tempo real.'
    },
    {
      icon: Shield,
      title: 'Segurança Total',
      description: 'Os seus dados estão protegidos com encriptação avançada.'
    }
  ];

  const steps = [
    { number: '01', title: 'Crie a sua conta', description: 'Registe-se gratuitamente em menos de 2 minutos.' },
    { number: '02', title: 'Envie os documentos', description: 'Carregue os documentos necessários para análise.' },
    { number: '03', title: 'Aguarde a análise', description: 'A nossa equipa analisa o seu pedido.' },
    { number: '04', title: 'Receba aprovação', description: 'Seja notificado assim que estiver aprovado.' }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="glass sticky top-0 z-50 border-b border-slate-100">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center">
            <img src="/myrenting-logo.png" alt="My Renting" className="h-8" />
          </Link>
          <div className="flex items-center gap-4">
            <Link to="/login">
              <Button variant="ghost" className="text-[#224c57]" data-testid="header-login-btn">
                Entrar
              </Button>
            </Link>
            <Link to="/register">
              <Button className="bg-[#224c57] hover:bg-[#224c57]/90" data-testid="header-register-btn">
                Criar Conta
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-10"
          style={{
            backgroundImage: `url(https://images.unsplash.com/photo-1745715689234-6e64c312d6fc?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2Mzl8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBlbGVjdHJpYyUyMGNhciUyMGx1eHVyeXxlbnwwfHx8fDE3NzI4MTQ0MTR8MA&ixlib=rb-4.1.0&q=85)`
          }}
        />
        <div className="container mx-auto px-4 py-24 md:py-32 relative">
          <div className="max-w-3xl">
            <h1
              className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#224c57] mb-6"
              style={{ fontFamily: 'Manrope, sans-serif', lineHeight: '1.1' }}
            >
              O seu renting automóvel{' '}
              <span className="text-[#4ad334]">simplificado</span>
            </h1>
            <p className="text-lg md:text-xl text-slate-600 mb-8 max-w-2xl">
              Submeta os seus documentos, acompanhe o estado da análise e conduza o seu novo carro em poucos dias.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/register">
                <Button
                  size="lg"
                  className="bg-[#224c57] hover:bg-[#224c57]/90 h-14 px-8 text-lg gap-2"
                  data-testid="hero-register-btn"
                >
                  Começar Agora
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <Link to="/login">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-2 border-[#224c57] text-[#224c57] h-14 px-8 text-lg"
                  data-testid="hero-login-btn"
                >
                  Já tenho conta
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-[#224c57] mb-4" style={{ fontFamily: 'Manrope, sans-serif' }}>
              Porquê escolher a My Renting?
            </h2>
            <p className="text-slate-600 max-w-2xl mx-auto">
              Tornamos o processo de renting automóvel simples, transparente e rápido.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card
                  key={index}
                  className="bg-white border-0 shadow-[0_4px_20px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.1)] transition-all duration-300 rounded-2xl"
                >
                  <CardContent className="p-8 text-center">
                    <div className="w-16 h-16 bg-[#40eea4]/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                      <Icon className="h-8 w-8 text-[#224c57]" />
                    </div>
                    <h3 className="text-xl font-semibold text-[#224c57] mb-3" style={{ fontFamily: 'Manrope, sans-serif' }}>
                      {feature.title}
                    </h3>
                    <p className="text-slate-500">{feature.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-[#224c57] mb-4" style={{ fontFamily: 'Manrope, sans-serif' }}>
              Como funciona?
            </h2>
            <p className="text-slate-600 max-w-2xl mx-auto">
              Quatro passos simples para ter o seu novo carro.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="relative">
                <div className="text-6xl font-bold text-[#40eea4]/30 mb-4" style={{ fontFamily: 'Manrope, sans-serif' }}>
                  {step.number}
                </div>
                <h3 className="text-xl font-semibold text-[#224c57] mb-2" style={{ fontFamily: 'Manrope, sans-serif' }}>
                  {step.title}
                </h3>
                <p className="text-slate-500">{step.description}</p>
                {index < steps.length - 1 && (
                  <ArrowRight className="hidden lg:block absolute top-8 -right-4 h-6 w-6 text-slate-300" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-[#224c57]">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6" style={{ fontFamily: 'Manrope, sans-serif' }}>
            Pronto para começar?
          </h2>
          <p className="text-slate-300 mb-8 max-w-xl mx-auto">
            Junte-se a centenas de clientes satisfeitos e simplifique o seu processo de renting automóvel.
          </p>
          <Link to="/register">
            <Button
              size="lg"
              className="bg-[#4ad334] hover:bg-[#4ad334]/90 text-black h-14 px-10 text-lg gap-2"
              data-testid="cta-register-btn"
            >
              Criar Conta Grátis
              <ArrowRight className="h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="mb-4 md:mb-0">
              <img src="/myrenting-logo.png" alt="My Renting" className="h-8 brightness-0 invert" />
            </div>
            <p className="text-sm">
              © {new Date().getFullYear()} My Renting. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
