import os
from django.conf import settings

def get_static_reviewai_dir():
    # Save images in reviewai/static/reviewai/
    return os.path.join(settings.BASE_DIR, 'reviewai', 'static', 'reviewai', 'charts')

def create_confusion_matrix_plot(confusion_matrix, model_name, save_path=None):
    import matplotlib
    matplotlib.use('Agg')
    import matplotlib.pyplot as plt
    import seaborn as sns

    plt.figure(figsize=(8, 6))
    sns.heatmap(
        confusion_matrix, 
        annot=True, 
        fmt='d', 
        cmap='Blues',
        xticklabels=['Genuine', 'Fake'],
        yticklabels=['Genuine', 'Fake'],
        cbar_kws={'label': 'Count'}
    )
    plt.title(f'{model_name.title()} Model - Confusion Matrix', fontsize=14, fontweight='bold')
    plt.ylabel('Actual', fontsize=12)
    plt.xlabel('Predicted', fontsize=12)
    plt.tight_layout()

    # Save to reviewai/static/reviewai/
    if save_path is None:
        static_dir = get_static_reviewai_dir()
        os.makedirs(static_dir, exist_ok=True)
        save_path = os.path.join(static_dir, f'confusion_matrix_{model_name}.png')

    plt.savefig(save_path, dpi=300, bbox_inches='tight')
    plt.close()
    return save_path

def create_performance_comparison_chart(performance_data, save_path=None):
    import matplotlib
    matplotlib.use('Agg')
    import matplotlib.pyplot as plt
    import numpy as np

    models = list(performance_data.keys())
    metrics = ['accuracy', 'precision', 'recall', 'f1_score']

    fig, ax = plt.subplots(figsize=(12, 8))
    x = np.arange(len(models))
    width = 0.2
    colors = ['#3498db', '#e74c3c', '#2ecc71', '#f39c12']

    for i, metric in enumerate(metrics):
        values = [performance_data[model][metric] for model in models]
        ax.bar(x + i * width, values, width, label=metric.title(), color=colors[i], alpha=0.8)

    ax.set_xlabel('Models', fontsize=12)
    ax.set_ylabel('Score', fontsize=12)
    ax.set_title('Model Performance Comparison', fontsize=14, fontweight='bold')
    ax.set_xticks(x + width * 1.5)
    ax.set_xticklabels([model.replace('_', ' ').title() for model in models])
    ax.legend()
    ax.grid(True, alpha=0.3)
    ax.set_ylim(0, 1.1)

    for i, metric in enumerate(metrics):
        values = [performance_data[model][metric] for model in models]
        for j, v in enumerate(values):
            ax.text(j + i * width, v + 0.01, f'{v:.2f}', ha='center', va='bottom', fontsize=9)

    plt.tight_layout()

    # Save to reviewai/static/reviewai/
    if save_path is None:
        static_dir = get_static_reviewai_dir()
        os.makedirs(static_dir, exist_ok=True)
        save_path = os.path.join(static_dir, 'performance_comparison.png')

    plt.savefig(save_path, dpi=300, bbox_inches='tight')
    plt.close()
    return save_path