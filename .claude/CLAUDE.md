# Project Instructions
 ## Proje adı:documentor
##Açıklama: bu proje geliştiricilerin basit bir arayüzle dökümantasyonlarını oluşturmasını amaçlıyor.
##Kullanılacak Teknolojiler:
Next 15 app router, tailwindCSS, DrizzleORM, NextAuth v5,(Auth.ts), middleware vb.
##Kurallar
1.	Giriş yapan kullanıcılar edit yapabilmeli dashboard sayfası olmalı ve kullanıcı Add Project butonuna basarak yeni bir proje oluşturmalı varsayılan ‘/’ routeunda hoşgeldiniz ve tanıtım arayüzü olmalı. 
2.	Giriş  yapmayan kullanıcılar ‘/dashboard’ sayfasına giderse middleware kullanarak ‘/login’ routena aktarılmalı.
3.	Auth provider olarak sadece Credentials (email + password) kullanılacak.
4.	DrizzleORM içinde postgreSQL kullanılmalı kullanıcının projeleri,bilgileri vb. orada tutulmalı
5.	Tasarım tailwind ile yapılmalı site genel renk teması olarak : #F9F8F6, #EFE9E3, #D9CFC7, #C9B59C renkleri kullanılmalı
6.	Projede typescipt yapısını kullan ve typescript kurallarına uymaya dikkat et. ‘any’ gibi veri tiplerini kullanma.
7.	Her adımda önce dosyayı oluştur, sonra bir sonrakine geç. Veritabanı bağlantısı için .env.local örneği de oluştur.
8.	Button değişkenler ve arayüz İngilizce olmalı.
9.	Convert to HTML butonu tıklandığında; tüm navbar elemanları, header listesi ve içerikleri, code blokları dahil olmak üzere inline CSS ve gerekli JS ile tek bir .html dosyası olarak indirilmeli (blob + anchor download yöntemiyle).
10.	schema şu tabloları içermeli: users, projects, headers (bir projeye ait alt başlıklar), navbar_items (kullanıcının navbar'a eklediği elementler) vb. Bir kullanıcının birden fazla projesi, bir projenin birden fazla header'ı olabilmeli.
11.	Sürükle bırak için @dnd-kit/core kullanılmalı.
12.	Mobil uyumluluk zorunlu değil ama en az 1280px genişlikte düzgün görünmeli.
13.	 .env.local.example dosyası oluşturulmalı ve içinde DATABASE_URL, NEXTAUTH_SECRET, NEXTAUTH_URL, ve seçilen OAuth provider'ın key'leri örnek olarak gösterilmeli.
14.	Proje editörü /dashboard/[projectId] route'unda açılmalı.
15.	Server action'larda her işlemde session kontrolü yapılmalı, kullanıcılar sadece kendi projelerine erişip düzenleyebilmeli. 
16.	Async işlemlerde loading state gösterilmeli, form submit sonrası toast notification ile başarı/hata mesajı verilmeli.
17.	Açıklama satırı kullanma.
## Dokümantasyon Kuralları
1.	Editör sayfası üç bölümden oluşmalı: Sol panel (header listesi, sabit genişlik ~240px), üst navbar (sürükle bırak alan, ~60px yükseklik), merkez alan (seçili header'ın içeriği). Aralarında belirgin border olmalı.
2.	Kullanıcıya  genel bir arayüz sağla istediği toolu ekleme özgülüğü olsun
3.	Çok fazla karmaşık bir yapı olmaması için varsayılan bir site layoutunu şu şekilde tasarla: Solda alt başlıkları ekleme yeri olsun kullanıc ‘New Header’ butonuna bastığı zaman yeni başlığı ekleyebildiği yer. Üstte main bar olarak da kullanıcının headera tıklayarak ulaştığı main bölüm olacak. Kullanıcı başlığın içeriğini oraya doldurabilecek. Üst tarafta da boş bir navbar olsun kullanıcı sürükle bırak ile istediğini ekleyebilmeli(Search box, proje ismini yazdığı bir başlık vb.)
4.	Code vb tarzda etiketler ile kullanı içeriği zenginleştirebilmeli örneğin code etiketi içine yazdığı şeyler code arayüzünde gözükebilmeli
5.	Code blokları için syntax highlighting desteklenmeli, bunun için highlight.js kullanılabilir.
6.	"İçerik editörü olarak Markdown tabanlı bir yapı kullan, react-markdown ile render edilmeli. Kullanıcı hem raw markdown yazabilmeli hem de önizleme görebilmeli."
7.	"Dashboard'da her proje kartı üzerinde Edit, Delete ve View butonları olmalı. Delete işleminde onay modalı çıkmalı."

## Dosya yapısı
app/ 
 actions/
  actions.ts
 dashboard/
   page.tsx
  login/
    LoginForm.tsx
    page.tsx 
  signup/
    SignUpForm.tsx
    page.tsx 
 auth.ts
 global.css
layout.tsx
page.tsx
favicon.ico
 db/
   schema.ts
   index.ts
 api/auth/[...nextauth]/(app/ klasörü içinde dikkat et)
  route.ts

NOT:dosya yapısı kesin değil üstünde değişiklikler yapabilirsin kullanıma bağlı olarak components dosyasını kullanabilirsin. Eksik bir dosya yapısı varsa eklemene izin veriyorum genel konularda(sürükle bırak işlevi gibi) kütüphane kurma gereksimi varsa kur.


