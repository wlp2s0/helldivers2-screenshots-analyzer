import cv2  # OpenCV per elaborazione immagini
import numpy as np  # NumPy per operazioni matematiche

# Leggi l'immagine da "screen/source.jpg"
# Carica l'immagine dal percorso specificato
image = cv2.imread('./screen/4.jpg')

# Imposta il colore target "74f3fe" in BGR (B: 254, G: 243, R: 116) e la tolleranza
# Definisci il colore obiettivo e la tolleranza per la ricerca
target_color = np.array([254, 243, 116])
tolerance = 30

# Calcola i limiti inferiori e superiori per il filtro del colore
lower_bound = np.clip(target_color - tolerance, 0, 255)
upper_bound = np.clip(target_color + tolerance, 0, 255)

# Crea la maschera dei pixel che rientrano nell'intervallo di colore specificato
mask = cv2.inRange(image, lower_bound, upper_bound)

# Trova i contorni nella maschera per individuare le regioni interessate
contours, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

# Funzione per verificare se due rettangoli si sovrappongono (con un margine)
def rect_overlap(a, b, margin=5):
    # a e b sono tuple (x, y, w, h)
    ax, ay, aw, ah = a
    bx, by, bw, bh = b
    # Restituisce True se i rettangoli si toccano o sono vicini entro il margine
    return (ax < bx + bw + margin and ax + aw + margin > bx and 
            ay < by + bh + margin and ay + ah + margin > by)

# Funzione per calcolare l'area di unione di due rettangoli
def rect_union(a, b):
    ax, ay, aw, ah = a
    bx, by, bw, bh = b
    # Determina le coordinate minime e massime per formare il rettangolo unito
    x = min(ax, bx)
    y = min(ay, by)
    w = max(ax + aw, bx + bw) - x
    h = max(ay + ah, by + bh) - y
    return (x, y, w, h)

# Funzione per unire i rettangoli che si toccano o si sovrappongono
def merge_rectangles(rects, margin=5):
    # Copia iniziale dei rettangoli
    merged = rects[:]
    changed = True
    # Continua ad unire fino a quando non ci sono cambiamenti
    while changed:
        changed = False
        new_merged = []
        used = [False] * len(merged)
        for i in range(len(merged)):
            if used[i]:
                continue
            current = merged[i]
            for j in range(i + 1, len(merged)):
                if used[j]:
                    continue
                if rect_overlap(current, merged[j], margin):
                    # Unisci i rettangoli se si toccano
                    current = rect_union(current, merged[j])
                    used[j] = True
                    changed = True
            new_merged.append(current)
        merged = new_merged
    return merged

# Nuovo helper: rimuove le box completamente annidate all'interno di altre
def filter_nested_boxes(boxes):
    filtered = []
    for i, box in enumerate(boxes):
        x, y, w, h = box
        is_inside = False
        for j, other in enumerate(boxes):
            if i != j:
                ox, oy, ow, oh = other
                # Verifica se la box corrente è contenuta in un'altra
                if x >= ox and y >= oy and x+w <= ox+ow and y+h <= oy+oh:
                    is_inside = True
                    break
        if not is_inside:
            filtered.append(box)
    return filtered

# Nuovo helper: rimuove le box troppo piccole
def filter_small_boxes(boxes, min_width=20, min_height=20):
    # Filtra box con larghezza e altezza maggiori o uguali ai minimi
    return [box for box in boxes if box[2] >= min_width and box[3] >= min_height]

# Calcola i rettangoli di bounding da ogni contorno trovato nella maschera
boxes = [cv2.boundingRect(c) for c in contours]

# Unisci i rettangoli vicini per ricostruire icone complete
merged_boxes = merge_rectangles(boxes, 10)

# Filtra le box che sono completamente annidate in altre
filtered_boxes = filter_nested_boxes(merged_boxes)

# Filtra le box troppo piccole
filtered_boxes = filter_small_boxes(filtered_boxes, 5, 5)

# Copia l'immagine originale per disegnare le annotazioni
image_copy = image.copy()

# Disegna i rettangoli e l'indice di ogni icona trovata
for idx, (x, y, w, h) in enumerate(filtered_boxes):
    cv2.rectangle(image_copy, (x, y), (x+w, y+h), (0, 255, 0), 2)  # Disegna il rettangolo
    cv2.putText(image_copy, f"{idx}", (x, y-10), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 1)  # Etichetta

# Log del numero di icone trovate, utile per il debug
print("Numero di icone trovate:", len(filtered_boxes))

# Salva l'immagine con le annotazioni sul file system
cv2.imwrite('./result.jpg', image_copy)
