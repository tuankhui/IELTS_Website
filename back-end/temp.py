
import matplotlib.pyplot as plt

# Data for advantages
advantages = {
    'Beautiful scenery': 82,
    'Peaceful atmosphere': 75,
    'Fresh air': 68,
    'Friendly locals': 55,
    'Access to nature': 49
}

# Data for disadvantages
disadvantages = {
    'Limited amenities': 60,
    'Poor transport links': 52,
    'Cost of living': 48,
    'Limited job opportunities': 35,
    'Lack of nightlife': 28
}

# Create subplots for advantages and disadvantages
fig, axes = plt.subplots(1, 2, figsize=(12, 6))

# Plot advantages
axes[0].bar(advantages.keys(), advantages.values())
axes[0].set_title('Advantages')
axes[0].set_ylabel('Percentage')
axes[0].set_xticklabels(advantages.keys(), rotation=45, ha='right')

# Plot disadvantages
axes[1].bar(disadvantages.keys(), disadvantages.values())
axes[1].set_title('Disadvantages')
axes[1].set_ylabel('Percentage')
axes[1].set_xticklabels(disadvantages.keys(), rotation=45, ha='right')

# Adjust layout and save
plt.tight_layout()
plt.savefig("./routes/graph.jpg")
