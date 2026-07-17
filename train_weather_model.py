import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, precision_score, recall_score, classification_report
import joblib

def load_and_preprocess_algerian(path="Algerian_forest_fires_dataset.csv"):
    # Veriyi yükle ve boşlukları temizle
    df = pd.read_csv(path)
    df.columns = df.columns.str.strip()
    
    # Arada kalan başlık tekrarlarını veya boş satırları temizle
    df = df.dropna(subset=['Temperature', 'Classes'])
    df = df[df['Temperature'] != 'Temperature']
    
    # Classes sütununu Target (0 ve 1) yap (not fire -> 0, fire -> 1)
    if 'Classes' in df.columns:
        df['Classes'] = df['Classes'].astype(str).str.strip()
        df['Target'] = df['Classes'].apply(lambda x: 1 if 'not fire' not in x.lower() else 0)
    else:
        df['Target'] = 0
        
    # Sadece ihtiyacımız olan ortak sütunları alalım
    cols_to_keep = ['Temperature', 'RH', 'Ws', 'Rain', 'FFMC', 'DMC', 'DC', 'ISI', 'Target']
    
    # Sütun isimlerindeki ufak farklılıklar (büyük/küçük harf vs) olabileceği için kontrol edelim
    # df.columns.tolist() içinde Rain , Ws vb. strip işlemiyle düzeldi
    df = df[[c for c in cols_to_keep if c in df.columns]]
    
    # Sayısal değerlere çevir
    for col in df.columns:
        df[col] = pd.to_numeric(df[col], errors='coerce')
        
    df = df.dropna()
    
    # Eğer eksik sütun varsa ekleyelim (normalde olmamalı)
    for c in cols_to_keep:
        if c not in df.columns:
            df[c] = 0
    return df[cols_to_keep]

def load_and_preprocess_montesinho(path="forestfires.csv"):
    df = pd.read_csv(path)
    
    # Target Belirleme: Yanan alan (area) > 0 ise yangın çıkmış (1) sayılır
    df['Target'] = (df['area'] > 0).astype(int)
    
    # Sütun isimlerini Algerian dataset'iyle aynı olacak şekilde değiştirelim
    df = df.rename(columns={'temp': 'Temperature', 'wind': 'Ws', 'rain': 'Rain'})
    
    cols_to_keep = ['Temperature', 'RH', 'Ws', 'Rain', 'FFMC', 'DMC', 'DC', 'ISI', 'Target']
    df = df[cols_to_keep]
    
    # Sayısal formata garanti olsun diye alalım
    for col in cols_to_keep:
        df[col] = pd.to_numeric(df[col], errors='coerce')
        
    df = df.dropna()
    return df

if __name__ == "__main__":
    print("Veri setleri yükleniyor ve temizleniyor...")
    
    df_alg = load_and_preprocess_algerian("Algerian_forest_fires_dataset.csv")
    df_ff = load_and_preprocess_montesinho("forestfires.csv")
    
    print(f"Cezayir Veriseti Boyutu: {df_alg.shape}")
    print(f"Montesinho Veriseti Boyutu: {df_ff.shape}")
    
    # İki veri setini dikey olarak birleştir
    df_combined = pd.concat([df_alg, df_ff], ignore_index=True)
    print(f"Birleştirilmiş Veriseti Boyutu: {df_combined.shape}")
    
    # Yeni birleştirilmiş veri setini diske kaydet
    df_combined.to_csv("combined_forest_fires.csv", index=False)
    print("Birleştirilmiş veriseti 'combined_forest_fires.csv' olarak kaydedildi.")
    
    # Model Eğitimi için x ve y ayrımı
    X = df_combined.drop('Target', axis=1)
    y = df_combined['Target']
    
    # Eğitim ve test alt kümelerine ayır (80% Eğitim, 20% Test)
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    print("\nRandom Forest Modeli Eğitiliyor...")
    model = RandomForestClassifier(n_estimators=100, random_state=42, class_weight='balanced')
    model.fit(X_train, y_train)
    
    # Test veri seti üzerinde değerlendirme
    y_pred = model.predict(X_test)
    print("\n--- Model Başarı Sonuçları ---")
    print(f"Doğruluk (Accuracy) : {accuracy_score(y_test, y_pred):.4f}")
    print(f"Kesinlik (Precision): {precision_score(y_test, y_pred):.4f}")
    print(f"Duyarlılık (Recall) : {recall_score(y_test, y_pred):.4f}")
    
    print("\nDetaylı Sınıflandırma Raporu:")
    print(classification_report(y_test, y_pred))
    
    # Eğitilmiş modeli dışa aktar (Deployment/Kullanım için)
    joblib.dump(model, "weather_fire_model.pkl")
    print("Makine öğrenmesi modeli 'weather_fire_model.pkl' olarak başarıyla kaydedildi.")
