# Mixed Content Demo

This page combines **code highlighting**, **math formulas**, **alerts**, **footnotes**, **emojis**, and standard markdown.

## Algorithm: Gradient Descent

The goal is to minimize a loss function $L(\theta)$ by iteratively updating parameters:

$$\theta_{t+1} = \theta_t - \eta \nabla L(\theta_t)$$

Here's a Python implementation:

```python
import numpy as np

def gradient_descent(f, grad_f, x0, lr=0.01, epochs=1000):
    """Minimize f starting from x0."""
    x = np.array(x0, dtype=float)
    history = [x.copy()]

    for _ in range(epochs):
        x -= lr * grad_f(x)
        history.append(x.copy())

    return x, np.array(history)

# Example: minimize f(x) = x^2
x_min, path = gradient_descent(
    f=lambda x: x**2,
    grad_f=lambda x: 2*x,
    x0=[5.0],
)
print(f"Minimum found at x = {x_min[0]:.6f}")
```

The convergence rate depends on the **learning rate** $\eta$ and the **condition number** $\kappa = \frac{\lambda_{\max}}{\lambda_{\min}}$ of the Hessian.

> [!TIP]
> Start with a small learning rate (e.g., $\eta = 0.01$) and increase gradually. If the loss oscillates, reduce the rate.

## Data Structures

### Binary Search Tree

A BST satisfies the property that for every node with key $k$:
- All keys in the left subtree are $< k$
- All keys in the right subtree are $> k$

Search complexity: $O(\log n)$ average, $O(n)$ worst case[^bst-worst].

```typescript
class BSTNode<T> {
  value: T;
  left: BSTNode<T> | null = null;
  right: BSTNode<T> | null = null;

  constructor(value: T) {
    this.value = value;
  }

  insert(value: T): void {
    if (value < this.value) {
      if (this.left) this.left.insert(value);
      else this.left = new BSTNode(value);
    } else {
      if (this.right) this.right.insert(value);
      else this.right = new BSTNode(value);
    }
  }
}
```

> [!NOTE]
> Self-balancing variants like AVL trees and Red-Black trees guarantee $O(\log n)$ for all operations.

## Comparison Table

| Feature | Highlight.js | KaTeX | Mermaid |
|---------|:---:|:---:|:---:|
| Code blocks | :check: | :x: | :x: |
| Math formulas | :x: | :check: | :x: |
| Diagrams | :x: | :x: | :check: |
| Bundle size | ~1MB | ~500KB | ~2MB |

## Blockquote with Math

> The beauty of mathematics is that $e^{i\pi} + 1 = 0$ unites
> the five most important constants in a single equation.
>
> -- Leonhard Euler (attributed)

## Complexity Classes

| Class | Definition | Example |
|-------|-----------|---------|
| $O(1)$ | Constant | Array access |
| $O(\log n)$ | Logarithmic | Binary search |
| $O(n)$ | Linear | Linear search |
| $O(n \log n)$ | Linearithmic | Merge sort |
| $O(n^2)$ | Quadratic | Bubble sort |
| $O(2^n)$ | Exponential | Subset enumeration |

## Progress :rocket:

- [x] Code highlighting :check:
- [x] Math rendering :check:
- [x] Mermaid diagrams :check:
- [x] GitHub alerts :check:
- [x] Footnotes :check:
- [x] Emojis :sparkles:
- [ ] Even more features...

> [!IMPORTANT]
> All these features work together seamlessly. The rendering pipeline handles each extension in order, ensuring correct output.

---

[^bst-worst]: The worst case occurs when elements are inserted in sorted order, degenerating the tree into a linked list.
