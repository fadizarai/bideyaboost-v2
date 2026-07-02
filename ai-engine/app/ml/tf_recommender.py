import tensorflow as tf
from tensorflow import keras

# ==========================================
# 1. Custom Layers for robust processing
# ==========================================
class DenseBlock(keras.layers.Layer):
    """Custom reusable dense block with BatchNormalization and Dropout as per best practices."""
    def __init__(self, units, dropout_rate=0.2, activation='relu', **kwargs):
        super(DenseBlock, self).__init__(**kwargs)
        self.dense = keras.layers.Dense(units)
        self.bn = keras.layers.BatchNormalization()
        self.activation = keras.activations.get(activation)
        self.dropout = keras.layers.Dropout(dropout_rate)

    def call(self, inputs, training=False):
        x = self.dense(inputs)
        x = self.bn(x, training=training)
        x = self.activation(x)
        return self.dropout(x, training=training)

    def get_config(self):
        config = super().get_config()
        config.update({
            'units': self.dense.units,
            'dropout_rate': self.dropout.rate,
            'activation': keras.activations.serialize(self.activation)
        })
        return config

# ==========================================
# 2. The Recommendation Architecture
# ==========================================
class OrientationRecommender(keras.Model):
    """
    Two-Tower Recommendation Model for Student-Institution matching.
    Tower 1: Learns Student Representations (Bac type, Score, RIASEC, Region)
    Tower 2: Learns Institution Representations (Code, Field, Capacity, Cutoff)
    """
    def __init__(self, num_bac_types, num_regions, num_inst_fields, embedding_dim=32, **kwargs):
        super(OrientationRecommender, self).__init__(**kwargs)
        self.num_bac_types = num_bac_types
        self.num_regions = num_regions
        self.num_inst_fields = num_inst_fields
        self.embedding_dim = embedding_dim
        
        # --- Student Tower Embeddings & Inputs ---
        self.bac_type_embedding = keras.layers.Embedding(num_bac_types, embedding_dim)
        self.region_embedding = keras.layers.Embedding(num_regions, embedding_dim)
        
        self.student_dense = keras.Sequential([
            DenseBlock(128),
            DenseBlock(64),
            keras.layers.Dense(embedding_dim, activation='linear') # Projection to shared space
        ], name="student_tower")
        
        # --- Institution Tower Embeddings & Inputs ---
        self.field_embedding = keras.layers.Embedding(num_inst_fields, embedding_dim)
        
        self.inst_dense = keras.Sequential([
            DenseBlock(128),
            DenseBlock(64),
            keras.layers.Dense(embedding_dim, activation='linear') # Projection to shared space
        ], name="institution_tower")

    def call(self, inputs, training=False):
        """
        inputs: Dictionary containing student and institution features
        """
        # 1. Process Student Features
        bac_emb = self.bac_type_embedding(inputs['bac_type_id'])
        reg_emb = self.region_embedding(inputs['student_region_id'])
        
        # Flatten embeddings if they have sequence length 1
        if len(bac_emb.shape) == 3:
            bac_emb = tf.squeeze(bac_emb, axis=1)
        if len(reg_emb.shape) == 3:
            reg_emb = tf.squeeze(reg_emb, axis=1)
            
        student_features = tf.concat([
            bac_emb, 
            reg_emb,
            inputs['student_bac_score'],  # Expected shape (batch, 1)
            inputs['student_riasec']      # Expected shape (batch, 6)
        ], axis=1)
        
        student_vector = self.student_dense(student_features, training=training)
        
        # 2. Process Institution Features
        field_emb = self.field_embedding(inputs['inst_field_id'])
        if len(field_emb.shape) == 3:
            field_emb = tf.squeeze(field_emb, axis=1)
            
        inst_features = tf.concat([
            field_emb,
            inputs['inst_cutoff_score']   # Expected shape (batch, 1)
        ], axis=1)
        
        inst_vector = self.inst_dense(inst_features, training=training)
        
        # 3. Compute Match Score (Cosine Similarity or Dot Product)
        # Using dot product to measure alignment between student and institution
        dot_product = tf.reduce_sum(student_vector * inst_vector, axis=1, keepdims=True)
        
        # Convert to probability (0 to 1) for match likelihood
        prediction = tf.nn.sigmoid(dot_product)
        
        if training:
            return prediction
        return {"predictions": prediction, "student_vector": student_vector, "inst_vector": inst_vector}
        
    def get_config(self):
        config = super().get_config()
        config.update({
            'num_bac_types': self.num_bac_types,
            'num_regions': self.num_regions,
            'num_inst_fields': self.num_inst_fields,
            'embedding_dim': self.embedding_dim,
        })
        return config

# ==========================================
# 3. Compilation and Training Configuration
# ==========================================
def build_and_compile_recommender(num_bac_types=10, num_regions=25, num_inst_fields=50, embedding_dim=32):
    model = OrientationRecommender(
        num_bac_types=num_bac_types, 
        num_regions=num_regions, 
        num_inst_fields=num_inst_fields, 
        embedding_dim=embedding_dim
    )
    
    model.compile(
        optimizer=keras.optimizers.Adam(learning_rate=0.001),
        loss=keras.losses.BinaryCrossentropy(),
        metrics=[
            keras.metrics.BinaryAccuracy(name='accuracy')
        ]
    )
    return model

