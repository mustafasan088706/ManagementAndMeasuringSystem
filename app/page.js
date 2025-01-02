'use client'
import { useState } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { Fragment } from 'react'
import { 
  ArrowRightIcon, BeakerIcon, ChartBarIcon, CpuChipIcon,
  ChatBubbleBottomCenterTextIcon, ShieldCheckIcon,
  GlobeAltIcon, SparklesIcon, UserGroupIcon
} from '@heroicons/react/24/outline'

export default function Home() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isRegisterOpen, setIsRegisterOpen] = useState(false)
  const [isLoginOpen, setIsLoginOpen] = useState(false)
  const [passwordError, setPasswordError] = useState('')
  const [formErrors, setFormErrors] = useState({
    name: '',
    email: '',
    password: '',
    passwordConfirm: '',
    securityQuestion: '',
    securityAnswer: '',
    terms: ''
  })
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    passwordConfirm: '',
    company: '',
    securityQuestion: '',
    securityAnswer: '',
    terms: false
  })

  // Form validation fonksiyonları
  const validateName = (name) => {
    if (!name.trim()) return 'Ad Soyad zorunludur'
    if (name.trim().length < 3) return 'Ad Soyad en az 3 karakter olmalıdır'
    if (name.trim().length > 50) return 'Ad Soyad çok uzun'
    if (!/^[a-zA-ZğüşıöçĞÜŞİÖÇ\s]+$/.test(name)) return 'Ad Soyad sadece harf içermelidir'
    if (!/^[A-ZĞÜŞİÖÇ][a-zğüşıöç]+(\s[A-ZĞÜŞİÖÇ][a-zğüşıöç]+)+$/.test(name)) {
      return 'Ad ve Soyad baş harfleri büyük olmalıdır'
    }
    return ''
  }

  const validateEmail = (email) => {
    if (!email) return 'E-posta zorunludur'
    if (email.length > 100) return 'E-posta adresi çok uzun'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Geçerli bir e-posta adresi giriniz'
    // Yaygın geçersiz domainleri kontrol et
    const invalidDomains = ['tempmail.com', 'throwaway.com']
    const domain = email.split('@')[1]
    if (invalidDomains.includes(domain)) return 'Geçerli bir e-posta domaini kullanın'
    return ''
  }

  const validatePassword = (password) => {
    if (!password) return 'Şifre zorunludur'
    if (password.length < 8) return 'Şifre en az 8 karakter olmalıdır'
    if (password.length > 50) return 'Şifre çok uzun'
    if (!/(?=.*[a-z])/.test(password)) return 'Şifre en az bir küçük harf içermelidir'
    if (!/(?=.*[A-Z])/.test(password)) return 'Şifre en az bir büyük harf içermelidir'
    if (!/(?=.*\d)/.test(password)) return 'Şifre en az bir rakam içermelidir'
    if (!/(?=.*[@$!%*?&])/.test(password)) return 'Şifre en az bir özel karakter içermelidir'
    if (/(.)\1{2,}/.test(password)) return 'Şifre ardışık tekrar eden karakterler içeremez'
    // Yaygın zayıf şifreleri kontrol et
    const commonPasswords = ['Password123!', 'Qwerty123!', 'Admin123!']
    if (commonPasswords.includes(password)) return 'Daha güçlü bir şifre seçin'
    return ''
  }

  const validatePasswordConfirm = (password, passwordConfirm) => {
    if (!passwordConfirm) return 'Şifre tekrarı zorunludur'
    if (password !== passwordConfirm) return 'Şifreler eşleşmiyor'
    return ''
  }

  const validateSecurityQuestion = (question, answer) => {
    if (!question) return 'Güvenlik sorusu seçiniz'
    if (!answer) return 'Güvenlik sorusu cevabı zorunludur'
    if (answer.trim().length < 2) return 'Cevap çok kısa'
    if (answer.trim().length > 100) return 'Cevap çok uzun'
    // Cevabın soru ile aynı olmamasını kontrol et
    if (answer.toLowerCase().includes(question.toLowerCase())) {
      return 'Cevap, sorunun bir parçası olmamalıdır'
    }
    return ''
  }

  const validateCompany = (company) => {
    if (company && company.length > 100) return 'Şirket adı çok uzun'
    if (company && /[<>{}]/.test(company)) return 'Geçersiz karakterler içeriyor'
    return ''
  }

  // Input değişikliklerini handle eden fonksiyon
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    const newValue = type === 'checkbox' ? checked : value

    // Input sanitization
    const sanitizedValue = type === 'text' || type === 'email' 
      ? value.trim().replace(/\s+/g, ' ')
      : value

    setFormData(prev => ({
      ...prev,
      [name]: type === 'text' || type === 'email' ? sanitizedValue : newValue
    }))

    // Anlık validation
    let error = ''
    switch (name) {
      case 'name':
        error = validateName(sanitizedValue)
        break
      case 'email':
        error = validateEmail(sanitizedValue.toLowerCase())
        break
      case 'password':
        error = validatePassword(value)
        // Şifre değiştiğinde confirm'i de kontrol et
        const confirmError = validatePasswordConfirm(value, formData.passwordConfirm)
        setFormErrors(prev => ({
          ...prev,
          passwordConfirm: confirmError
        }))
        break
      case 'passwordConfirm':
        error = validatePasswordConfirm(formData.password, value)
        break
      case 'company':
        error = validateCompany(sanitizedValue)
        break
      case 'securityQuestion':
      case 'securityAnswer':
        error = validateSecurityQuestion(
          name === 'securityQuestion' ? value : formData.securityQuestion,
          name === 'securityAnswer' ? sanitizedValue : formData.securityAnswer
        )
        break
    }

    setFormErrors(prev => ({
      ...prev,
      [name]: error
    }))
  }

  // Form submit handler
  const handleRegisterSubmit = async (e) => {
    e.preventDefault()

    // Tüm alanları validate et
    const errors = {
      name: validateName(formData.name),
      email: validateEmail(formData.email.toLowerCase()),
      password: validatePassword(formData.password),
      passwordConfirm: validatePasswordConfirm(formData.password, formData.passwordConfirm),
      company: validateCompany(formData.company),
      securityQuestion: validateSecurityQuestion(formData.securityQuestion, formData.securityAnswer),
      terms: !formData.terms ? 'Kullanım şartlarını kabul etmelisiniz' : ''
    }

    setFormErrors(errors)

    // Hata var mı kontrol et
    if (Object.values(errors).some(error => error)) {
      return
    }

    try {
      // Form verilerini hazırla
      const formDataToSubmit = {
        ...formData,
        email: formData.email.toLowerCase(),
        name: formData.name.trim(),
        company: formData.company?.trim(),
        securityAnswer: formData.securityAnswer.trim()
      }

      // Form başarılı, kayıt işlemini gerçekleştir
      console.log('Form data:', formDataToSubmit)
      // API çağrısı burada yapılacak
      
      // Başarılı kayıt sonrası
      setIsRegisterOpen(false)
      // Başarılı kayıt mesajı göster
    } catch (error) {
      console.error('Kayıt hatası:', error)
      // Hata mesajı göster
    }
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation - Responsive iyileştirmeler */}
      <nav className="bg-white/80 backdrop-blur-md fixed w-full z-50 border-b border-gray-100">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo ve marka */}
            <div className="flex items-center space-x-2">
              <SparklesIcon className="w-6 h-6 md:w-8 md:h-8 text-primary" />
              <span className="text-lg md:text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent whitespace-nowrap">
                Management System
              </span>
            </div>

            {/* Mobile Menu Button - Daha iyi tıklama alanı */}
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-3 text-gray-600 hover:text-primary focus:outline-none rounded-lg hover:bg-gray-100"
              aria-label="Menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>

            {/* Desktop Menu - Daha iyi spacing */}
            <div className="hidden md:flex items-center space-x-6 lg:space-x-8">
              <NavLink href="#features">Özellikler</NavLink>
              <NavLink href="#solutions">Çözümler</NavLink>
              <NavLink href="#testimonials">Referanslar</NavLink>
              <NavLink href="#contact">İletişim</NavLink>
            </div>

            {/* Auth Buttons - Responsive düzenleme */}
            <div className="hidden md:flex items-center space-x-4">
              <button 
                onClick={() => setIsRegisterOpen(true)}
                className="bg-white text-primary hover:text-secondary border-2 border-primary hover:border-secondary px-4 lg:px-6 py-2 rounded-lg text-sm font-semibold transition-all whitespace-nowrap"
              >
                Kayıt Ol
              </button>
              <button 
                onClick={() => setIsLoginOpen(true)}
                className="bg-primary hover:bg-secondary text-white px-4 lg:px-6 py-2 rounded-lg text-sm font-semibold transition-all hover:shadow-lg whitespace-nowrap"
              >
                Giriş Yap
              </button>
            </div>
          </div>

          {/* Mobile Menu Panel - İyileştirilmiş görünüm */}
          <Transition
            show={isMenuOpen}
            enter="transition-all duration-200 ease-out"
            enterFrom="opacity-0 -translate-y-2"
            enterTo="opacity-100 translate-y-0"
            leave="transition-all duration-150 ease-in"
            leaveFrom="opacity-100 translate-y-0"
            leaveTo="opacity-0 -translate-y-2"
            className="md:hidden"
          >
            <div className="bg-white border-t border-gray-100 py-4 px-4">
              <div className="flex flex-col space-y-4">
                <MobileNavLink href="#features" onClick={() => setIsMenuOpen(false)}>
                  Özellikler
                </MobileNavLink>
                <MobileNavLink href="#solutions" onClick={() => setIsMenuOpen(false)}>
                  Çözümler
                </MobileNavLink>
                <MobileNavLink href="#testimonials" onClick={() => setIsMenuOpen(false)}>
                  Referanslar
                </MobileNavLink>
                <MobileNavLink href="#contact" onClick={() => setIsMenuOpen(false)}>
                  İletişim
                </MobileNavLink>
                <div className="pt-4 border-t border-gray-100 flex flex-col space-y-3">
                  <button 
                    onClick={() => {
                      setIsMenuOpen(false)
                      setIsRegisterOpen(true)
                    }}
                    className="w-full bg-white text-primary border-2 border-primary hover:border-secondary py-2.5 px-4 rounded-lg text-sm font-semibold transition-colors"
                  >
                    Kayıt Ol
                  </button>
                  <button 
                    onClick={() => {
                      setIsMenuOpen(false)
                      setIsLoginOpen(true)
                    }}
                    className="w-full bg-primary text-white hover:bg-secondary py-2.5 px-4 rounded-lg text-sm font-semibold transition-colors"
                  >
                    Giriş Yap
                  </button>
                </div>
              </div>
            </div>
          </Transition>
        </div>
      </nav>

      {/* Hero Section - Responsive iyileştirmeler */}
      <section className="relative min-h-[85vh] flex items-center justify-center px-4 sm:px-6 lg:px-8 pt-24 md:pt-32 pb-16 bg-gradient-to-b from-blue-50/50 to-white">
        <div className="container max-w-7xl mx-auto">
          <div className="max-w-4xl mx-auto text-center space-y-6 md:space-y-8">
            <div className="inline-flex items-center bg-blue-50 rounded-full px-3 py-1 md:px-4 md:py-2">
              <span className="text-xs md:text-sm font-medium text-primary">🚀 Yeni Özellikler Eklendi!</span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
              İşletmenizi Modern Yöntemlerle
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent block mt-2">
                Yönetin ve Ölçümleyin
              </span>
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed">
              Gelişmiş yönetim ve ölçüm araçlarımızla işletmenizi daha verimli hale getirin.
              Analiz, raporlama ve optimizasyon ile rekabet avantajı elde edin.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button className="w-full sm:w-auto group bg-primary hover:bg-secondary text-white px-6 md:px-8 py-3 md:py-4 rounded-lg font-semibold inline-flex items-center justify-center transition-all hover:shadow-xl text-sm md:text-base">
                Ücretsiz Deneyin
                <ArrowRightIcon className="w-4 h-4 md:w-5 md:h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </button>
              <button className="w-full sm:w-auto bg-white hover:bg-gray-50 text-gray-800 px-6 md:px-8 py-3 md:py-4 rounded-lg font-semibold inline-flex items-center justify-center border-2 border-gray-200 hover:border-primary transition-all text-sm md:text-base">
                <GlobeAltIcon className="w-4 h-4 md:w-5 md:h-5 mr-2" />
                Demo İzleyin
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section - Spacing düzenlemesi */}
      <section id="features" className="py-20 sm:py-24 lg:py-32 bg-gray-50">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader 
            title="Öne Çıkan Özellikler"
            subtitle="En son teknolojiler ile güçlendirilmiş çözümlerimiz"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-10 mt-12">
            <FeatureCard
              icon={<BeakerIcon className="w-8 h-8" />}
              title="Akıllı Veri Analizi"
              description="Gelişmiş algoritmalarımız ile verilerinizden anlamlı içgörüler elde edin."
              color="blue"
            />
            <FeatureCard
              icon={<ChartBarIcon className="w-8 h-8" />}
              title="Tahminleme Modelleri"
              description="Makine öğrenimi ile geleceğe yönelik doğru tahminler yapın."
              color="indigo"
            />
            <FeatureCard
              icon={<CpuChipIcon className="w-8 h-8" />}
              title="Akıllı Otomasyon"
              description="İş süreçlerinizi yapay zeka ile otomatikleştirin."
              color="violet"
            />
          </div>
        </div>
      </section>

      {/* Solutions Section - Margin düzenlemesi */}
      <section id="solutions" className="py-20 sm:py-24 lg:py-32 bg-white">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-start">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-8">
                İşletmeniz için Özel Çözümler
              </h2>
              <p className="text-xl text-gray-600 mb-12">
                Her işletmenin kendine özgü ihtiyaçları vardır. Size özel çözümler sunuyoruz.
              </p>
              <div className="space-y-8">
                <SolutionItem
                  icon={<ShieldCheckIcon className="w-7 h-7" />}
                  title="Güvenlik Odaklı"
                  description="ISO 27001 sertifikalı altyapı ile verileriniz güvende"
                />
                <SolutionItem
                  icon={<ChatBubbleBottomCenterTextIcon className="w-7 h-7" />}
                  title="7/24 Teknik Destek"
                  description="Uzman ekibimiz her an yanınızda"
                />
                <SolutionItem
                  icon={<UserGroupIcon className="w-7 h-7" />}
                  title="Özel Danışmanlık"
                  description="İşletmenize özel AI stratejisi ve yol haritası"
                />
              </div>
            </div>
            <div className="bg-gradient-to-br from-gray-50 to-white p-10 rounded-2xl shadow-lg border border-gray-100">
              <h3 className="text-3xl font-bold text-gray-900 mb-8">Başarı Hikayemiz</h3>
              <div className="grid gap-6">
                <Statistic number="500+" text="Mutlu Müşteri" />
                <Statistic number="98%" text="Müşteri Memnuniyeti" />
                <Statistic number="10x" text="Verimlilik Artışı" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section - Spacing optimizasyonu */}
      <section id="testimonials" className="py-20 sm:py-24 lg:py-32 bg-gray-50">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader 
            title="Müşterilerimiz Ne Diyor?"
            subtitle="Başarı hikayelerini dinleyin"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-10 mt-12">
            <TestimonialCard
              quote="AI Solutions ile veri analiz süremizi %70 kısalttık."
              author="Ahmet Yılmaz"
              role="CTO, Tech Corp"
              image="/placeholder.jpg"
            />
            <TestimonialCard
              quote="Müşteri memnuniyetimiz yapay zeka chatbot ile %40 arttı."
              author="Ayşe Kaya"
              role="CEO, E-Commerce Plus"
              image="/placeholder.jpg"
            />
            <TestimonialCard
              quote="Tahminleme modelleri ile stok maliyetlerimizi %30 azalttık."
              author="Mehmet Demir"
              role="COO, Retail Group"
              image="/placeholder.jpg"
            />
          </div>
        </div>
      </section>

      {/* CTA Section - Ortalama düzeltmesi */}
      <section id="contact" className="relative py-20 sm:py-24 lg:py-32 bg-gradient-to-r from-primary to-secondary overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/10"></div>
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6 md:mb-8">
              Yapay Zeka Yolculuğunuza Bugün Başlayın
            </h2>
            <p className="text-lg md:text-xl text-white/90 mb-8 md:mb-10">
              14 gün ücretsiz deneme ve özel demo için hemen iletişime geçin.
            </p>
            <form className="max-w-md mx-auto space-y-4">
              <input
                type="text"
                placeholder="Adınız"
                className="w-full px-4 md:px-6 py-3 md:py-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/50 bg-white/10 text-white placeholder-white/70 border border-white/20 text-sm md:text-base"
              />
              <input
                type="email"
                placeholder="E-posta adresiniz"
                className="w-full px-4 md:px-6 py-3 md:py-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/50 bg-white/10 text-white placeholder-white/70 border border-white/20 text-sm md:text-base"
              />
              <button className="w-full bg-white text-primary hover:bg-blue-50 font-bold py-3 md:py-4 px-6 md:px-8 rounded-lg transition-all hover:shadow-xl text-sm md:text-base">
                Ücretsiz Demo Talep Et
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Register Modal */}
      <Transition appear show={isRegisterOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={() => setIsRegisterOpen(false)}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-8 text-left align-middle shadow-xl transition-all border border-gray-100">
                  <div className="absolute right-4 top-4">
                    <button
                      onClick={() => setIsRegisterOpen(false)}
                      className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  <Dialog.Title as="h3" className="text-2xl font-bold text-gray-900 mb-6">
                    Hesap Oluştur
                  </Dialog.Title>
                  <form onSubmit={handleRegisterSubmit} className="space-y-5">
                    {/* Form fields */}
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                        Ad Soyad
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors ${
                          formErrors.name ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Adınız Soyadınız"
                      />
                      {formErrors.name && (
                        <p className="mt-1 text-xs text-red-500">{formErrors.name}</p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                        E-posta
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors ${
                          formErrors.email ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="ornek@email.com"
                      />
                      {formErrors.email && (
                        <p className="mt-1 text-xs text-red-500">{formErrors.email}</p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                        Şifre
                      </label>
                      <input
                        type="password"
                        id="password"
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors ${
                          formErrors.password ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="********"
                      />
                      {formErrors.password && (
                        <p className="mt-1 text-xs text-red-500">{formErrors.password}</p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="passwordConfirm" className="block text-sm font-medium text-gray-700 mb-1">
                        Şifre Tekrar
                      </label>
                      <input
                        type="password"
                        id="passwordConfirm"
                        name="passwordConfirm"
                        value={formData.passwordConfirm}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors ${
                          formErrors.passwordConfirm ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="********"
                      />
                      {formErrors.passwordConfirm && (
                        <p className="mt-1 text-xs text-red-500">{formErrors.passwordConfirm}</p>
                      )}
                    </div>

                    <div className="space-y-5 border-t border-gray-100 pt-5">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">Güvenlik Sorusu</span>
                        <span className="text-xs text-gray-500">Hesap kurtarma için kullanılacak</span>
                      </div>
                      
                      <div>
                        <label htmlFor="securityQuestion" className="block text-sm font-medium text-gray-700 mb-1">
                          Güvenlik Sorunuzu Seçin
                        </label>
                        <select
                          id="securityQuestion"
                          name="securityQuestion"
                          value={formData.securityQuestion}
                          onChange={handleInputChange}
                          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors bg-white ${
                            formErrors.securityQuestion ? 'border-red-500' : 'border-gray-300'
                          }`}
                        >
                          <option value="">Seçiniz...</option>
                          <option value="pet">İlk evcil hayvanınızın adı nedir?</option>
                          <option value="city">Doğduğunuz şehir neresidir?</option>
                          <option value="school">İlkokul öğretmeninizin adı nedir?</option>
                          <option value="color">En sevdiğiniz renk nedir?</option>
                          <option value="book">En sevdiğiniz kitap nedir?</option>
                          <option value="mother">Annenizin kızlık soyadı nedir?</option>
                          <option value="street">Çocukluğunuzda yaşadığınız sokağın adı nedir?</option>
                          <option value="car">İlk arabanızın markası nedir?</option>
                        </select>
                        {formErrors.securityQuestion && (
                          <p className="mt-1 text-xs text-red-500">{formErrors.securityQuestion}</p>
                        )}
                      </div>

                      <div>
                        <label htmlFor="securityAnswer" className="block text-sm font-medium text-gray-700 mb-1">
                          Cevabınız
                        </label>
                        <input
                          type="text"
                          id="securityAnswer"
                          name="securityAnswer"
                          value={formData.securityAnswer}
                          onChange={handleInputChange}
                          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors ${
                            formErrors.securityAnswer ? 'border-red-500' : 'border-gray-300'
                          }`}
                          placeholder="Güvenlik sorusunun cevabı"
                        />
                        {formErrors.securityAnswer && (
                          <p className="mt-1 text-xs text-red-500">{formErrors.securityAnswer}</p>
                        )}
                        <p className="mt-1 text-xs text-gray-500">
                          Bu cevabı unutmayın, hesabınızı kurtarmak için gerekli olacak
                        </p>
                      </div>

                      <div className="bg-blue-50/50 p-4 rounded-lg border border-blue-100">
                        <h4 className="text-sm font-medium text-blue-800 mb-2 flex items-center">
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Güvenlik İpuçları
                        </h4>
                        <ul className="text-xs text-blue-700 space-y-1 list-disc list-inside">
                          <li>Başkaları tarafından tahmin edilmesi zor bir cevap seçin</li>
                          <li>Cevabınızı güvenli bir yerde saklayın</li>
                          <li>Bu bilgiyi kimseyle paylaşmayın</li>
                          <li>Sosyal medyada paylaştığınız bilgilerden farklı bir cevap seçin</li>
                          <li>Büyük/küçük harf kullanımına dikkat edin</li>
                        </ul>
                      </div>
                    </div>

                    <div className="flex items-center mt-4">
                      <input
                        type="checkbox"
                        id="terms"
                        name="terms"
                        checked={formData.terms}
                        onChange={handleInputChange}
                        className={`h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded ${
                          formErrors.terms ? 'border-red-500' : ''
                        }`}
                      />
                      <label htmlFor="terms" className="ml-2 block text-sm text-gray-600">
                        <span>Kullanım şartlarını ve </span>
                        <a href="#" className="text-primary hover:text-secondary">gizlilik politikasını</a>
                        <span> kabul ediyorum</span>
                      </label>
                    </div>
                    {formErrors.terms && (
                      <p className="text-xs text-red-500">{formErrors.terms}</p>
                    )}

                    <div className="mt-6 space-x-3">
                      <button
                        type="submit"
                        className="bg-primary hover:bg-secondary text-white px-6 py-2.5 rounded-lg text-sm font-semibold transition-all hover:shadow-lg"
                      >
                        Kayıt Ol
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsRegisterOpen(false)}
                        className="text-gray-600 hover:text-gray-800 px-6 py-2.5 rounded-lg text-sm font-semibold transition-colors"
                      >
                        İptal
                      </button>
                    </div>
                  </form>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>

      {/* Login Modal */}
      <Transition appear show={isLoginOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={() => setIsLoginOpen(false)}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-8 text-left align-middle shadow-xl transition-all border border-gray-100">
                  <div className="absolute right-4 top-4">
                    <button
                      onClick={() => setIsLoginOpen(false)}
                      className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  <Dialog.Title as="h3" className="text-2xl font-bold text-gray-900 mb-6">
                    Giriş Yap
                  </Dialog.Title>
                  <form className="space-y-5">
                    <div>
                      <label htmlFor="login-email" className="block text-sm font-medium text-gray-700 mb-1">
                        E-posta
                      </label>
                      <input
                        type="email"
                        id="login-email"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
                        placeholder="ornek@email.com"
                      />
                    </div>
                    <div>
                      <label htmlFor="login-password" className="block text-sm font-medium text-gray-700 mb-1">
                        Şifre
                      </label>
                      <input
                        type="password"
                        id="login-password"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
                        placeholder="********"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="remember-me"
                          className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                        />
                        <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-600">
                          Beni hatırla
                        </label>
                      </div>
                      <a href="#" className="text-sm text-primary hover:text-secondary transition-colors">
                        Şifremi unuttum
                      </a>
                    </div>
                    <div className="mt-6 space-x-3">
                      <button
                        type="submit"
                        className="bg-primary hover:bg-secondary text-white px-6 py-2.5 rounded-lg text-sm font-semibold transition-all hover:shadow-lg"
                      >
                        Giriş Yap
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setIsLoginOpen(false)
                          setIsRegisterOpen(true)
                        }}
                        className="text-gray-600 hover:text-gray-800 px-6 py-2.5 rounded-lg text-sm font-semibold transition-colors"
                      >
                        Hesap Oluştur
                      </button>
                    </div>
                  </form>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>

      {/* Footer - Spacing düzenlemesi */}
      <footer className="bg-gray-900 text-white py-16 sm:py-20">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-8 lg:gap-12">
            <div>
              <div className="flex items-center space-x-2 mb-6">
                <SparklesIcon className="w-6 h-6 text-primary" />
                <span className="text-xl font-bold">AI Solutions</span>
              </div>
              <p className="text-gray-400">
                Yapay zeka ile işletmenizi geleceğe taşıyoruz.
              </p>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Çözümler</h4>
              <FooterLink href="#" text="Veri Analizi" />
              <FooterLink href="#" text="Tahminleme" />
              <FooterLink href="#" text="Otomasyon" />
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Şirket</h4>
              <FooterLink href="#" text="Hakkımızda" />
              <FooterLink href="#" text="Kariyer" />
              <FooterLink href="#" text="Blog" />
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">İletişim</h4>
              <FooterLink href="#" text="info@aisolutions.com" />
              <FooterLink href="#" text="+90 (212) 555 0123" />
              <FooterLink href="#" text="İstanbul, Türkiye" />
            </div>
          </div>
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; 2024 AI Solutions. Tüm hakları saklıdır.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

// Helper Components
function NavLink({ href, children }) {
  return (
    <a 
      href={href} 
      className="text-gray-600 hover:text-primary transition-colors text-sm lg:text-base font-medium"
    >
      {children}
    </a>
  )
}

function SectionHeader({ title, subtitle }) {
  return (
    <div className="text-center mb-12 sm:mb-16">
      <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 sm:mb-6">
        {title}
      </h2>
      <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
        {subtitle}
      </p>
    </div>
  )
}

function FeatureCard({ icon, title, description, color }) {
  const colorClasses = {
    blue: 'from-blue-500 to-blue-600',
    indigo: 'from-indigo-500 to-indigo-600',
    violet: 'from-violet-500 to-violet-600'
  }

  return (
    <div className="group h-full p-6 sm:p-8 rounded-xl bg-white shadow-lg hover:shadow-2xl transition-all hover:-translate-y-1 border border-gray-100">
      <div className={`w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 rounded-xl bg-gradient-to-r ${colorClasses[color]} flex items-center justify-center text-white mb-4 sm:mb-6 group-hover:scale-110 transition-transform`}>
        {icon}
      </div>
      <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4">{title}</h3>
      <p className="text-sm sm:text-base text-gray-600 leading-relaxed">{description}</p>
    </div>
  )
}

function SolutionItem({ icon, title, description }) {
  return (
    <div className="flex items-start space-x-6 group">
      <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
        {icon}
      </div>
      <div>
        <h4 className="text-xl font-semibold text-gray-900 mb-2">{title}</h4>
        <p className="text-gray-600 text-lg">{description}</p>
      </div>
    </div>
  )
}

function Statistic({ number, text }) {
  return (
    <div className="text-center p-6 bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow">
      <div className="text-4xl font-bold text-primary mb-2">{number}</div>
      <div className="text-gray-600 text-lg">{text}</div>
    </div>
  )
}

function Metric({ label, value }) {
  return (
    <div className="text-center px-2 sm:px-4">
      <div className="text-xl sm:text-2xl font-bold text-primary mb-0.5 sm:mb-1">{value}</div>
      <div className="text-xs sm:text-sm text-gray-600">{label}</div>
    </div>
  )
}

function TestimonialCard({ quote, author, role, image }) {
  return (
    <div className="h-full bg-white p-5 sm:p-6 lg:p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
      <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6 italic min-h-[4rem]">"{quote}"</p>
      <div className="flex items-center mt-auto">
        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gray-200 mr-3 sm:mr-4"></div>
        <div>
          <h4 className="font-semibold text-gray-900 text-sm sm:text-base">{author}</h4>
          <p className="text-gray-600 text-xs sm:text-sm">{role}</p>
        </div>
      </div>
    </div>
  )
}

function FooterLink({ href, text }) {
  return (
    <a href={href} className="block text-gray-400 hover:text-white transition-colors mb-2">
      {text}
    </a>
  )
}

function MobileNavLink({ href, children, onClick }) {
  return (
    <a
      href={href}
      onClick={onClick}
      className="block py-2 text-gray-600 hover:text-primary transition-colors text-lg"
    >
      {children}
    </a>
  )
} 