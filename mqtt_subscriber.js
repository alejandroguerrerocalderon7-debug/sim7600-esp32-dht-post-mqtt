// =========================================================
// mqtt_subscriber.js - Listener para guardar datos en PostgreSQL
// =========================================================

const mqtt = require('mqtt');
const { Pool } = require('pg'); 

// ---------------------------------------------------------
// 1. CONFIGURACIÓN DE LA BASE DE DATOS
// ---------------------------------------------------------

// Render proporciona la variable de entorno DATABASE_URL automáticamente
// cuando conectas los servicios internos (Internal Connections).
const dbConfig = {
    connectionString: process.env.DATABASE_URL,
    
    // Configuración SSL necesaria para conexiones seguras en Render
    ssl: { rejectUnauthorized: false } 
};

// **Verificación Crítica:** Si la variable no existe, el proceso termina para diagnosticar el fallo.
if (!process.env.DATABASE_URL) {
    console.error("❌ ERROR CRÍTICO: La variable de entorno DATABASE_URL no está configurada.");
    console.error("Asegúrate de haber conectado la base de datos (telemetria-db) al servicio Node.js en Render.");
    process.exit(1); 
}

const pool = new Pool(dbConfig); 
console.log('✅ Configuración de PostgreSQL inicializada. Usando DATABASE_URL.');


// ---------------------------------------------------------
// 2. CONFIGURACIÓN DE MQTT
// ---------------------------------------------------------
const brokerUrl = 'mqtt://broker.hivemq.com:1883'; 
const topic = 'ESP32_SIM7600_SENSOR_DATA';
const client = mqtt.connect(brokerUrl);


// ---------------------------------------------------------
// 3. FUNCIÓN DE INSERCIÓN EN LA BASE DE DATOS
// ---------------------------------------------------------
async function insertTelemetry(payload) {
    
    // Verificamos si los campos de latitud y longitud son "N/A" y los convertimos a NULL
    const lat = (payload.lat === 'N/A') ? null : payload.lat;
    const lon = (payload.lon === 'N/A') ? null : payload.lon;

    const query = `
        INSERT INTO telemetria (
            device_id, lat, lon, 
            t1, h1, t2, h2, t3, h3, t4, h4, t5, h5, t6, h6
        ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15
        );
    `;

    const values = [
        payload.device_id, lat, lon,
        payload.T1, payload.H1, payload.T2, payload.H2,
        payload.T3, payload.H3, payload.T4, payload.H4,
        payload.T5, payload.H5, payload.T6, payload.H6
    ];

    try {
        await pool.query(query, values);
        console.log(`[${new Date().toISOString()}] ✅ Datos de DEVICE ${payload.device_id} insertados en DB.`);
    } catch (err) {
        console.error('❌ Error al insertar datos en la base de datos:', err);
        // Si hay error, imprime el error de la base de datos
        console.error('Detalle del error DB:', err.message);
    }
}


// ---------------------------------------------------------
// 4. LÓGICA DE CONEXIÓN Y MENSAJES MQTT
// ---------------------------------------------------------

client.on('connect', () => {
    console.log('✅ Conectado al broker MQTT.');
    client.subscribe(topic, (err) => {
        if (!err) {
            console.log(`✅ Suscrito al tópico: ${topic}.`);
        } else {
            console.error('❌ Error al suscribirse:', err);
        }
    });
});

client.on('error', (error) => {
    console.error('❌ Error de conexión MQTT:', error);
});


client.on('message', (receivedTopic, message) => {
    if (receivedTopic === topic) {
        try {
            const payload = JSON.parse(message.toString());
            
            // Llamada a la función para guardar en la base de datos
            insertTelemetry(payload); 

        } catch (e) {
            console.error('❌ Error al parsear JSON recibido:', e);
        }
    }
});

client.on('close', () => {
    console.log('⚠️ Desconectado del servidor.');
});
