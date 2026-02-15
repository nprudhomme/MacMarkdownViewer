# Code Highlighting

## JavaScript

```javascript
function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

const result = fibonacci(10);
console.log(`Fibonacci(10) = ${result}`);
```

## TypeScript

```typescript
interface User {
  id: number;
  name: string;
  email: string;
}

async function fetchUser(id: number): Promise<User> {
  const response = await fetch(`/api/users/${id}`);
  return response.json();
}
```

## Python

```python
import numpy as np
from dataclasses import dataclass

@dataclass
class Point:
    x: float
    y: float

    def distance_to(self, other: "Point") -> float:
        return np.sqrt((self.x - other.x) ** 2 + (self.y - other.y) ** 2)

points = [Point(i, i**2) for i in range(10)]
```

## Rust

```rust
use std::collections::HashMap;

fn word_count(text: &str) -> HashMap<&str, usize> {
    let mut counts = HashMap::new();
    for word in text.split_whitespace() {
        *counts.entry(word).or_insert(0) += 1;
    }
    counts
}

fn main() {
    let text = "hello world hello rust hello world";
    let counts = word_count(text);
    println!("{:?}", counts);
}
```

## SQL

```sql
SELECT
    u.name,
    COUNT(o.id) AS order_count,
    SUM(o.total) AS total_spent
FROM users u
LEFT JOIN orders o ON o.user_id = u.id
WHERE u.created_at >= '2024-01-01'
GROUP BY u.id, u.name
HAVING COUNT(o.id) > 5
ORDER BY total_spent DESC
LIMIT 10;
```

## CSS

```css
.container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  padding: 2rem;
}

@media (prefers-color-scheme: dark) {
  .container {
    background: #1a1a2e;
    color: #e0e0e0;
  }
}
```

## Shell / Bash

```bash
#!/bin/bash
set -euo pipefail

for file in *.md; do
    echo "Processing: $file"
    wc -w "$file" | awk '{print $1, "words"}'
done
```

## JSON

```json
{
  "name": "markdown-viewer",
  "version": "0.4.1",
  "dependencies": {
    "marked": "^17.0.2",
    "highlight.js": "^11.0.0",
    "katex": "^0.16.0"
  }
}
```

## Inline Code

You can also use `inline code` like `const x = 42` or `npm install` in regular text.
