# Graph Layout Optimization

## Problem

When displaying the full practice dependency tree in expanded view, practices are arranged in horizontal levels. Without optimization, connections between levels can create long, crossing lines that make the visualization hard to follow.

## Solution: Barycenter Method

We use the **Barycenter heuristic** to optimize the horizontal ordering of nodes within each level to minimize connection line lengths and crossings.

### Algorithm

The optimization works through iterative sweeps:

1. **Top-Down Sweep**: For each level, position nodes based on the average position of their parent nodes
2. **Bottom-Up Sweep**: For each level, position nodes based on the average position of their child nodes
3. **Repeat**: Multiple iterations (default: 3) to converge on a good layout

### Mathematical Foundation

For a node `n` in level `i`, its barycenter is:

```
barycenter(n) = Σ(position of connected nodes) / count of connections
```

Nodes are then sorted by their barycenter value, placing nodes with similar connection patterns near each other.

## Implementation

### Core Function

```javascript
// src/lib/domain/practice-graph/layout.js
export const optimizeLayerOrdering = (groupedByLevel, (iterations = 3))
```

### Usage in Component

```javascript
// src/lib/components/PracticeGraph.svelte
const groupedByLevel = $derived(() => {
	const grouped = flattenedTree.reduce(/* group by level */)
	return optimizeLayerOrdering(grouped, 3) // Optimize!
})
```

## Example

### Before Optimization (Alphabetical)

```
Level 0:  [continuous-delivery]
             |    |    |
Level 1:  [a]  [b]  [c]  [d]
           \  \/  \/  /
            \ /\  /\ /
Level 2:    [w] [x] [y] [z]
```

Many crossing lines, long connections.

### After Optimization (Barycenter)

```
Level 0:  [continuous-delivery]
             |    |    |
Level 1:  [a]  [b]  [c]  [d]
           |    |    |    |
Level 2:  [w]  [x]  [y]  [z]
```

Minimized crossings, shorter connections.

## Benefits

1. **Reduced Visual Clutter**: Fewer crossing lines
2. **Better Readability**: Clearer dependency paths
3. **Shorter Connections**: Easier to trace relationships
4. **Automatic**: No manual positioning needed
5. **Performance**: O(n\*k) where n=nodes, k=iterations (typically 3)

## Configuration

The number of optimization iterations can be adjusted:

```javascript
optimizeLayerOrdering(grouped, iterations)
```

- **iterations=1**: Fast, basic optimization
- **iterations=3**: Default, good balance
- **iterations=5+**: Diminishing returns

## Algorithm Complexity

- **Time**: O(n × k × m) where:
  - n = number of nodes
  - k = number of iterations (3)
  - m = average connections per node
- **Space**: O(n) for position tracking

## Alternative Approaches Considered

1. **Median Heuristic**: Similar to barycenter but uses median instead of mean
   - Pro: More robust to outliers
   - Con: Slightly more complex, marginal benefit

2. **Simulated Annealing**: Randomized optimization
   - Pro: Can find global optimum
   - Con: Non-deterministic, slower

3. **Force-Directed Layout**: Physics-based simulation
   - Pro: Natural-looking layouts
   - Con: Doesn't respect hierarchical levels

4. **Category Grouping**: Group by practice category
   - Pro: Creates semantic clusters
   - Con: May increase connection lengths

## Future Enhancements

- Add toggle for different layout strategies
- Combine barycenter + category grouping
- Visualize layout quality metrics
- Allow manual drag-and-drop reordering
- Add animation when switching layouts

## References

- Sugiyama, K., Tagawa, S., & Toda, M. (1981). "Methods for Visual Understanding of Hierarchical System Structures"
- Eiglsperger, M., & Kaufmann, M. (2001). "An Efficient Implementation of Sugiyama's Algorithm for Layered Graph Drawing"
