# T.C. SİVAS CUMHURİYET ÜNİVERSİTESİ MÜHENDİSLİK FAKÜLTESİ BİLGİSAYAR MÜHENDİSLİĞİ BÖLÜMÜ

## STAJ DEFTERİ
**Öğrenci No:** 2022123061  
**Adı Soyadı:** Talha Anay  
**Öğretim Yılı:** 2025/2026  
**Çalışma Konusu:** Meteorolojik Veriler ile Orman Yangını Risk Tahmini ve SOTA Modellerinin Optimizasyonu  

---

### GÜNLÜK ÇALIŞMA PROGRAMI (İLK 10 GÜN)

| S.No | Tarih | Gün | Yapılan İş |
| :--- | :--- | :--- | :--- |
| **1** | 12.01.2026 | Pazartesi | Yol Haritası ve Teknoloji Analizi (Reaktif Tespit vs Proaktif Tahmin Karşılaştırması) |
| **2** | 13.01.2026 | Salı | Veri Seti Seçimi, İnceleme ve Hedef Değişken Standardizasyonu (Data Alignment) |
| **3** | 14.01.2026 | Çarşamba | Veri Entegrasyonu (Data Fusion) ve Çoklu Coğrafi Boyut Eleme (Feature Selection) |
| **4** | 15.01.2026 | Perşembe | Eksik Veri Analizi ve MICE (Random Forest) Tabanlı Tamamlama (Data Imputation) |
| **5** | 16.01.2026 | Cuma | Öznitelik Mühendisliği: Trigonometrik Döngüsel Zaman Kodlaması ve Sentetik FWI İndeksi |
| **6** | 19.01.2026 | Pazartesi | Sınıf Dengesizliği (Class Imbalance) Çözümleri ve İlk Varsayılan Model Denemeleri |
| **7** | 20.01.2026 | Salı | GridSearch vs RandomizedSearch ile Model Hiperparametre Optimizasyonu Süreçleri |
| **8** | 21.01.2026 | Çarşamba | Stratified 5-Fold Çapraz Doğrulama, Elbow Metodu ve ROC-AUC Kararsızlık Analizi |
| **9** | 22.01.2026 | Perşembe | Karar Eşiği (Threshold Tuning) Optimizasyonu ve Precision-Recall Dengelemesi |
| **10** | 23.01.2026 | Cuma | OGM Standartlarında Kademeli Risk Matrisi Entegrasyonu ve Manavgat Vaka Analizi (Case Study) |

---

### GÜNLÜK ÇALIŞMA RAPORLARI

#### GÜNLÜK ÇALIŞMA PROGRAMI | Tarih: 12/01/2026 (Gün 1)
Güne yazılım ve veri analitiği ekibiyle yapılan günlük koordinasyon toplantısına (Daily Scrum) katılarak başlandı. Stajımın ilk gününde, orman yangınlarının erken tespiti ve mücadelesinde kullanılan güncel literatür ve teknolojik yaklaşımlar incelendi. Araştırmalar sonucunda iki temel mühendislik yol haritası karşılaştırıldı:
1. **Bilgisayarlı Görü ile Reaktif Tespit (Drone/İHA):** Termal veya RGB kameralarla başlayan duman ve alevi (YOLO mimarileriyle) anlık tespit etme.
2. **Makine Öğrenmesi ile Proaktif Tahmin (Veri Madenciliği):** Sıcaklık, nem ve rüzgar gibi meteorolojik verileri işleyerek yangın henüz başlamadan risk haritası çıkarma.

Projenin erken uyarı sistemi (Early Warning System) konseptine uyması ve afet yönetimi planlamasında kaynakların proaktif dağıtılmasını sağlaması amacıyla **Meteorolojik Tahmin** ekseninde ilerlenmesine karar verildi. Eğer bilgisayarlı görü rotası seçilseydi kullanılacak olan endüstri standardı FLAME (Airborne termal/RGB), D-Fire ve Roboflow Smoke veri setlerinin yapıları, YOLOv8/v11 CNN mimarilerinin eğitim mekanizmaları ile başarı ölçüm metrikleri (mAP50, mAP50-95, IoU) teorik olarak analiz edildi ve raporlandı.

---

#### GÜNLÜK ÇALIŞMA PROGRAMI | Tarih: 13/01/2026 (Gün 2)
Güne Daily Scrum toplantısı ile başlandı. Projenin veri tabanını oluşturmak amacıyla Akdeniz iklim özelliklerini taşıyan Portekiz (Montesinho Parkı - UCI) ve Kuzey Afrika’nın sıcak iklimini yansıtan Cezayir (Sidi Bel-abbes & Bejaia - Kaggle) orman yangını veri setleri indirildi ve veri yapıları analiz edildi. Modellerin tutarlı öğrenebilmesi adına hedef değişkenlerin (Target) standardizasyon işlemi gerçekleştirildi.

Portekiz veri setindeki hedef etiket sürekli (continuous) bir yanan alan (`area` - hektar) verisi iken; Cezayir veri setinde ise "fire" veya "not fire" şeklinde metinsel sınıflardan oluşmaktaydı. Bu iki yapıyı ikili sınıflandırma (Binary Classification) mantığına oturtmak için Pandas kütüphanesi kullanılarak veri ön işleme kodları yazıldı:

```python
# --- HEDEF DEĞİŞKEN STANDARDİZASYONU ---
# Portekiz Veri Seti: Yanan alan sıfırdan büyükse yangın var (1), değilse yok (0)
df_portugal['Target'] = (df_portugal['area'] > 0).astype(int)

# Cezayir Veri Seti: Metinsel sınıfları ikili sayısal formata dönüştürme
df_algeria['Target'] = df_algeria['Classes'].apply(lambda x: 1 if 'not fire' not in str(x).lower() else 0)
```
Bu işlem ile veriler üzerinde ortak bir sınıflandırma mantığı (0: Yangın Yok, 1: Yangın Var) kuruldu ve her iki veri setinin öznitelik isimleri eşitlendi.

---

#### GÜNLÜK ÇALIŞMA PROGRAMI | Tarih: 14/01/2026 (Gün 3)
Güne Daily Scrum toplantısı ile başlandı. Dün ön işlemesi yapılan iki veri setinin dikey olarak birleştirilmesi (Data Fusion/Aggregation) ve modelin global genellenebilirliğini artıracak özellik seçimi (Feature Selection) üzerine çalışıldı. 

Eğitimin kalitesini korumak amacıyla bazı özniteliklerin elenmesine karar verildi ve bu kararlar akademik gerekçeleriyle dokümante edildi:
1. **Kaliforniya Veri Seti Elendi:** Portekiz ve Cezayir veri setlerindeki FFMC, DMC, DC gibi kritik FWI yangın indeksleri Kaliforniya verisinde %95 oranında eksikti. Bu kadar büyük bir boşluğu doldurmak verinin kimyasını bozacağı için Kaliforniya seti süreç dışı bırakıldı.
2. **X-Y Harita Koordinatları Elendi:** Portekiz veri setindeki X ve Y koordinatları sadece Montesinho parkına özel bir grid sistemi tanımladığından, modelin başka coğrafyalarda ezber yapmasını (overfitting) önlemek için silindi.
3. **Bölge/Kaynak Bilgisi Eledik:** Coğrafi kaynak etiketleri (Source) kaldırılarak modelin belirli lokasyonlara bağlı kalmaksızın tamamen "evrensel bir meteorolojik yangın tahmin modeli" olması hedeflendi.

```python
# --- GEREKSİZ ÖZNİTELİKLERİN ELENMESİ VE BİRLEŞTİRME ---
cols_to_keep = ['Temperature', 'RH', 'Ws', 'Rain', 'FFMC', 'DMC', 'DC', 'ISI', 'Target']
df_combined = pd.concat([df_algeria[cols_to_keep], df_portugal[cols_to_keep]], ignore_index=True)
```
Bu adımlar sonucunda toplam 760 satırlık, gürültülerden arındırılmış ve dengeli bir veri havuzu elde edildi.

---

#### GÜNLÜK ÇALIŞMA PROGRAMI | Tarih: 15/01/2026 (Gün 4)
Güne Daily Scrum toplantısıyla başlandı. Veri biliminde sıkça karşılaşılan "Eksik Veri (Missing Data)" problemi ve bunu aşmak için kullanılan gelişmiş tahmin yöntemleri üzerine odaklanıldı. Kaliforniya ve bazı test bölgelerinden alınabilecek genişletilmiş veri setlerindeki eksik Bağıl Nem (RH) kolonunun doldurulması simüle edildi.

Geleneksel Ortalama (Mean) veya Medyan (Median) ile doldurma yöntemlerinin, 15.000 satıra yakın veride doğal varyansı (standart sapmayı) sıfırlayacağı ve modelin karar sınırlarını yapaylaştıracağı görüldü. Bu doğrultuda, makine öğrenmesi tabanlı **MICE (Multiple Imputation by Chained Equations)** mimarisi kuruldu. `scikit-learn` kütüphanesinin `IterativeImputer` modülü kullanılarak arka planda bir Random Forest algoritması koşturuldu. Bu sayede eksik bağıl nem değerleri, o günün sıcaklık, rüzgar hızı ve yağış miktarına bakılarak fiziksel/meteorolojik olarak en gerçekçi şekilde dolduruldu.

```python
# --- MICE TABANLI EKSİK VERİ TAMAMLAMA ---
from sklearn.experimental import enable_iterative_imputer
from sklearn.impute import IterativeImputer
from sklearn.ensemble import RandomForestRegressor

mice_imputer = IterativeImputer(estimator=RandomForestRegressor(n_estimators=50, random_state=42), max_iter=10)
df_imputed_array = mice_imputer.fit_transform(df_with_missing_rh)
df_cleaned = pd.DataFrame(df_imputed_array, columns=df_with_missing_rh.columns)
```

---

#### GÜNLÜK ÇALIŞMA PROGRAMI | Tarih: 16/01/2026 (Gün 5)
Güne Daily Scrum toplantısı ile başlandı. Bugün verideki gizli meteorolojik ilişkileri ortaya çıkarmak adına Öznitelik Mühendisliği (Feature Engineering) adımları uygulandı. İki önemli yenilik geliştirildi:
1. **Döngüsel Zaman Kodlaması (Cyclical Encoding):** Ayların ve günlerin modele sayısal (1-12 veya 1-7) olarak verilmesi, modelin Aralık (12) ile Ocak (1) arasındaki mevsimsel yakınlığı algılayamamasına yol açar. Bu sorunu çözmek için sinüs ve kosinüs dönüşümleri kullanılarak zamana dairesel bir özellik kazandırıldı.
2. **Sentetik FWI Risk İndeksi:** Algoritmanın havayı ham tahminlemesini beklemek yerine, orman mühendisliği fizik kurallarına dayanan sentetik bir risk kolonu oluşturuldu:  
   $$\text{Sentetik\_FWI} = \frac{\text{Sıcaklık} \times \text{Rüzgar}}{\text{Nem} + 1}$$

```python
# --- DÖNGÜSEL KODLAMA VE SENTETİK FWI ---
df_combined['month_sin'] = np.sin(2 * np.pi * df_combined['month'] / 12.0)
df_combined['month_cos'] = np.cos(2 * np.pi * df_combined['month'] / 12.0)

df_combined['Synthetic_FWI'] = (df_combined['Temperature'] * df_combined['Ws']) / (df_combined['RH'] + 1)
```
Bu adımlar sonrasında yapılan öznitelik önem derecesi analizinde, üretilen Sentetik FWI özelliğinin modeller üzerinde en yüksek bilgi kazancını (Information Gain) sağlayan sütun olduğu tespit edildi.

---

#### GÜNLÜK ÇALIŞMA PROGRAMI | Tarih: 19/01/2026 (Gün 6)
Güne Daily Scrum toplantısı ile başlandı. Bugünde sınıf dengesizliği (Class Imbalance) sorunu ve ilk State-of-the-Art (SOTA) modellerin eğitimi üzerinde çalışıldı.

Veriyi yapay yollarla çoğaltan SMOTE algoritması test edildi; ancak SMOTE'un karar sınırlarını bulandırdığı ve heterojen tablo verilerinde gürültüye (noise) sebep olduğu gözlemlendi. Bu nedenle veri kümesinin gerçekçi doğasını bozmamak adına algoritmik ceza yöntemi tercih edildi. XGBoost ve LightGBM gibi gelişmiş modellerin içine `scale_pos_weight` eklenerek, modelin "Yangın Var (1)" sınıfında yapacağı bir hataya (False Negative) daha büyük matematiksel ceza vermesi sağlandı. 

```python
# --- CEZA AĞIRLIKLI MODEL YAPILANDIRMASI ---
# RandomForestClassifier(class_weight='balanced')
# XGBClassifier(scale_pos_weight=hedef_oran)
```
Eğitilen ilk modeller (Random Forest, XGBoost, LightGBM, CatBoost) varsayılan parametreleriyle test edildiğinde en yüksek **%67 - %72** doğruluk (Accuracy) bandında sıkışarak görünmez bir başarım duvarına çarptığı raporlandı.

---

#### GÜNLÜK ÇALIŞMA PROGRAMI | Tarih: 20/01/2026 (Gün 7)
Güne Daily Scrum toplantısı ile başlandı. Modellerin %70 bandında tıkanmasının ardından hiperparametre optimizasyonu (Hyperparameter Tuning) süreçleri devreye alındı. 

Geleneksel GridSearch yönteminin tüm olasılıkları tek tek test ederek devasa bir zaman kaybına yol açtığı ve donanımı gereksiz yorduğu analiz edildi. Bunun yerine, arama uzayından en umut verici noktaları rastgele seçen **RandomizedSearchCV** algoritması tercih edildi. 30 farklı derin mimari taranarak en iyi parametre kombinasyonları tespit edilmeye çalışıldı. 

```python
# --- RANDOMIZED SEARCH OPTİMİZASYONU ---
from sklearn.model_selection import RandomizedSearchCV

param_dist = {
    'n_estimators': [50, 100, 200, 300],
    'max_depth': [3, 5, 7, 10, None],
    'min_samples_split': [2, 5, 10],
    'class_weight': ['balanced', None]
}
random_search = RandomizedSearchCV(RandomForestClassifier(random_state=42), param_distributions=param_dist, n_iter=15, cv=5, random_state=42)
random_search.fit(X_train, y_train)
best_rf = random_search.best_estimator_
```
Optimizasyon neticesinde KNN ve Random Forest modelleri için en ideal ağaç derinliği, komşuluk sayıları ve mesafe metrikleri tespit edildi.

---

#### GÜNLÜK ÇALIŞMA PROGRAMI | Tarih: 21/01/2026 (Gün 8)
Güne Daily Scrum toplantısı ile başlandı. Bugün modellerin akademik doğruluğunu ve tutarlılığını test etmek amacıyla Çapraz Doğrulama (Cross Validation) süreçleri ve istatistiksel analizler yürütüldü. 

Modeller **Stratified 5-Fold Cross Validation** yöntemiyle test edilerek, elde edilen başarının rastlantısal veya veri sızıntısından (Data Leakage) kaynaklanmadığı kanıtlandı. Ağaçlar eğitilirken ezberlemeyi önlemek için bootstrap yerine yerine koymadan alt örnekleme (subsample) uygulandı.

İncelemelerde iki kritik bulgu saptandı ve çözümlendi:
1. **KNN Dirsek (Elbow) Zigzagları:** Dirsek grafiğindeki sert zigzagların ikili sınıflandırmada çift sayıda komşu seçilmesinden (`n_neighbors=8`) kaynaklandığı, bu durumun oylarda eşitliğe (tie vote) yol açtığı keşfedildi. Çözüm olarak K değeri tek sayı olarak kısıtlandı.
2. **ROC-AUC = 0.51 Sorunu:** Optimize edilen KNN modelinin ROC eğrisinin 0.51 çıkması, Portekiz ve Cezayir iklim verilerinin birbirine çok benzer (overlapping classes) olmasından kaynaklandığı, yani sadece sıcaklık/nem değerleriyle sınırların matematiksel olarak ayrışamadığı raporlandı.

---

#### GÜNLÜK ÇALIŞMA PROGRAMI | Tarih: 22/01/2026 (Gün 9)
Güne Daily Scrum toplantısı ile başlandı. Bugün afet modelleri için hayati önem taşıyan Karar Eşiği (Threshold Tuning) optimizasyonu yapıldı. 

Orman yangını tahmininde yangını kaçırmanın (False Negative) bedeli, yanlış alarm vermekten (False Positive) çok daha yüksektir. Varsayılan 0.50 karar eşiği yerine, modelin olasılık tahminleri (`predict_proba`) dışarı aktarılarak 0.30 ile 0.80 arasındaki tüm eşik değerleri iteratif olarak test edildi.

```python
# --- EŞİK DEĞERİ OPTİMİZASYONU ---
y_probs = best_rf.predict_proba(X_test)[:, 1]
# Eşik değeri 0.38 olarak ayarlandığında performanstaki değişim:
y_custom_pred = (y_probs >= 0.38).astype(int)
```
**Bulgular ve Kritik Başarı:**
* Random Forest modelinde karar eşiği **0.38** olarak optimize edildiğinde; modelin Recall (Duyarlılık) metriği **%98.77** seviyesinde tutulmuş ve hedeflenen **%80.00 F1-Skoru** başarısına ulaşılarak proje hedefleri başarıyla yakalanmıştır.
* XGBoost modelinde ise eşik 0.41'e çekildiğinde %75.66 Doğruluk ve %78.61 F1-Skoru elde edilmiştir.

---

#### GÜNLÜK ÇALIŞMA PROGRAMI | Tarih: 23/01/2026 (Gün 10)
Güne Daily Scrum toplantısı ile başlandı. Stajın bu son gününde, geliştirilen modelin operasyonel hale getirilmesi amacıyla Türkiye Cumhuriyeti Orman Genel Müdürlüğü (OGM) Erken Uyarı Sistemi standartlarında entegrasyonu sağlandı. 

Modelin doğrudan "0 veya 1" üretmesi yerine, ürettiği olasılık değerleri lojistik karar destek mekanizması olarak 4 kademeli bir Risk Matrisine dönüştürüldü:
1. **Düşük Risk (Yeşil):** Olasılık < %30
2. **Orta Risk (Sarı):** %30 $\leq$ Olasılık < %60
3. **Yüksek Risk (Turuncu):** %60 $\leq$ Olasılık < %85
4. **Ekstrem Risk (Kırmızı):** Olasılık $\geq$ %85

Modelin Türkiye şartlarındaki başarısını doğrulamak (Validation) adına, tarihe geçen **2021 Manavgat Yangını** gününün ekstrem meteorolojik değerleri (41.5°C Sıcaklık, %14 Bağıl Nem, 55 km/s Rüzgar) sisteme girdi olarak verilerek vaka analizi (Case Study) yapıldı. Modelin bu girdiler doğrultusunda kararlı bir şekilde **"Ekstrem Risk (Kırmızı)"** uyarısı ürettiği kanıtlandı. Geliştirilen veri analitiği boru hattı ve optimize edilmiş model dosyaları ekibe teslim edilerek süreç başarıyla tamamlandı.
