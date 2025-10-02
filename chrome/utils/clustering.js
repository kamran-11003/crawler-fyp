/**
 * State abstraction and page clustering algorithms
 * Implements smart clustering to avoid redundant crawling of similar pages
 */

/**
 * Cluster pages by functional equivalence
 */
export function clusterPagesByFunctionality(pages, threshold = 0.8) {
  const clusters = [];
  const processed = new Set();
  
  for (let i = 0; i < pages.length; i++) {
    if (processed.has(i)) continue;
    
    const cluster = {
      id: `cluster_${clusters.length}`,
      representative: pages[i],
      members: [pages[i]],
      centroid: pages[i].stateVector || {},
      size: 1
    };
    
    // Find similar pages
    for (let j = i + 1; j < pages.length; j++) {
      if (processed.has(j)) continue;
      
      const similarity = calculatePageSimilarity(pages[i], pages[j]);
      if (similarity >= threshold) {
        cluster.members.push(pages[j]);
        cluster.size++;
        processed.add(j);
      }
    }
    
    // Update centroid
    cluster.centroid = calculateClusterCentroid(cluster.members);
    clusters.push(cluster);
    processed.add(i);
  }
  
  return clusters;
}

/**
 * Calculate similarity between two pages
 */
export function calculatePageSimilarity(page1, page2) {
  // Compare state vectors if available
  if (page1.stateVector && page2.stateVector) {
    return calculateStateVectorSimilarity(page1.stateVector, page2.stateVector);
  }
  
  // Fallback to URL structure similarity
  const urlSimilarity = calculateUrlSimilarity(page1.url, page2.url);
  
  // Compare element counts
  const elementSimilarity = calculateElementSimilarity(page1.elements, page2.elements);
  
  // Compare functional features
  const featureSimilarity = calculateFeatureSimilarity(page1.functionalFeatures, page2.functionalFeatures);
  
  // Weighted average
  return (urlSimilarity * 0.3 + elementSimilarity * 0.4 + featureSimilarity * 0.3);
}

/**
 * Calculate URL structure similarity
 */
function calculateUrlSimilarity(url1, url2) {
  try {
    const url1Obj = new URL(url1);
    const url2Obj = new URL(url2);
    
    // Same domain gets higher similarity
    if (url1Obj.hostname !== url2Obj.hostname) {
      return 0;
    }
    
    // Compare path structure
    const path1 = normalizePath(url1Obj.pathname);
    const path2 = normalizePath(url2Obj.pathname);
    
    return calculateStringSimilarity(path1, path2);
  } catch (e) {
    return 0;
  }
}

/**
 * Normalize path by replacing dynamic segments
 */
function normalizePath(path) {
  return path
    .split('/')
    .map(segment => {
      if (/^\d+$/.test(segment)) return '{id}';
      if (/^[a-f0-9-]{8,}$/i.test(segment)) return '{uuid}';
      if (segment.includes('?')) return '{query}';
      return segment;
    })
    .join('/');
}

/**
 * Calculate string similarity using Levenshtein distance
 */
function calculateStringSimilarity(str1, str2) {
  const maxLength = Math.max(str1.length, str2.length);
  if (maxLength === 0) return 1;
  
  const distance = levenshteinDistance(str1, str2);
  return 1 - (distance / maxLength);
}

/**
 * Calculate Levenshtein distance between two strings
 */
function levenshteinDistance(str1, str2) {
  const matrix = [];
  
  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }
  
  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }
  
  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  
  return matrix[str2.length][str1.length];
}

/**
 * Calculate element similarity
 */
function calculateElementSimilarity(elements1, elements2) {
  if (!elements1 || !elements2) return 0;
  
  const typeCount1 = countElementTypes(elements1);
  const typeCount2 = countElementTypes(elements2);
  
  const allTypes = new Set([...Object.keys(typeCount1), ...Object.keys(typeCount2)]);
  let totalElements = 0;
  let matchingElements = 0;
  
  for (const type of allTypes) {
    const count1 = typeCount1[type] || 0;
    const count2 = typeCount2[type] || 0;
    const maxCount = Math.max(count1, count2);
    
    totalElements += maxCount;
    matchingElements += Math.min(count1, count2);
  }
  
  return totalElements > 0 ? matchingElements / totalElements : 0;
}

/**
 * Count elements by type
 */
function countElementTypes(elements) {
  const counts = {};
  
  elements.forEach(element => {
    const type = element.nodeType || element.tagName?.toLowerCase() || 'unknown';
    counts[type] = (counts[type] || 0) + 1;
  });
  
  return counts;
}

/**
 * Calculate feature similarity
 */
function calculateFeatureSimilarity(features1, features2) {
  if (!features1 || !features2) return 0;
  
  const allFeatures = new Set([...Object.keys(features1), ...Object.keys(features2)]);
  let matchingFeatures = 0;
  let totalFeatures = 0;
  
  for (const feature of allFeatures) {
    const value1 = features1[feature];
    const value2 = features2[feature];
    
    totalFeatures++;
    if (value1 === value2) {
      matchingFeatures++;
    }
  }
  
  return totalFeatures > 0 ? matchingFeatures / totalFeatures : 0;
}

/**
 * Calculate cluster centroid
 */
function calculateClusterCentroid(members) {
  if (members.length === 0) return {};
  
  const centroid = {
    elementCounts: {},
    functionalFeatures: {},
    contentFeatures: {},
    stateFeatures: {},
    accessibilityFeatures: {}
  };
  
  // Calculate average element counts
  const allElementTypes = new Set();
  members.forEach(member => {
    if (member.elements) {
      const typeCounts = countElementTypes(member.elements);
      Object.keys(typeCounts).forEach(type => allElementTypes.add(type));
    }
  });
  
  allElementTypes.forEach(type => {
    const counts = members.map(member => {
      if (member.elements) {
        const typeCounts = countElementTypes(member.elements);
        return typeCounts[type] || 0;
      }
      return 0;
    });
    
    centroid.elementCounts[type] = counts.reduce((sum, count) => sum + count, 0) / counts.length;
  });
  
  // Calculate feature consensus
  const featureCategories = ['functionalFeatures', 'contentFeatures', 'stateFeatures', 'accessibilityFeatures'];
  
  featureCategories.forEach(category => {
    const allFeatures = new Set();
    members.forEach(member => {
      if (member[category]) {
        Object.keys(member[category]).forEach(feature => allFeatures.add(feature));
      }
    });
    
    allFeatures.forEach(feature => {
      const values = members.map(member => {
        return member[category] && member[category][feature] ? 1 : 0;
      });
      
      const consensus = values.reduce((sum, val) => sum + val, 0) / values.length;
      centroid[category][feature] = consensus > 0.5;
    });
  });
  
  return centroid;
}

/**
 * Select representative pages from clusters
 */
export function selectRepresentativePages(clusters, maxPages = 10) {
  const representatives = [];
  
  // Sort clusters by size (larger clusters get priority)
  const sortedClusters = clusters.sort((a, b) => b.size - a.size);
  
  for (const cluster of sortedClusters) {
    if (representatives.length >= maxPages) break;
    
    // Select the most representative page from the cluster
    const representative = selectBestRepresentative(cluster);
    representatives.push(representative);
  }
  
  return representatives;
}

/**
 * Select the best representative from a cluster
 */
function selectBestRepresentative(cluster) {
  if (cluster.members.length === 1) {
    return cluster.members[0];
  }
  
  // Find the page closest to the centroid
  let bestPage = cluster.members[0];
  let bestScore = calculatePageToCentroidSimilarity(cluster.members[0], cluster.centroid);
  
  for (let i = 1; i < cluster.members.length; i++) {
    const score = calculatePageToCentroidSimilarity(cluster.members[i], cluster.centroid);
    if (score > bestScore) {
      bestScore = score;
      bestPage = cluster.members[i];
    }
  }
  
  return bestPage;
}

/**
 * Calculate similarity between a page and cluster centroid
 */
function calculatePageToCentroidSimilarity(page, centroid) {
  if (!page.stateVector) return 0;
  
  return calculateStateVectorSimilarity(page.stateVector, centroid);
}

/**
 * Calculate state vector similarity (imported from hashing.js)
 */
function calculateStateVectorSimilarity(vector1, vector2) {
  let totalFeatures = 0;
  let matchingFeatures = 0;
  
  // Compare element counts
  for (const [key, value1] of Object.entries(vector1.elementCounts || {})) {
    const value2 = vector2.elementCounts?.[key] || 0;
    totalFeatures++;
    if (Math.abs(value1 - value2) <= 1) {
      matchingFeatures++;
    }
  }
  
  // Compare functional features
  for (const [key, value1] of Object.entries(vector1.functionalFeatures || {})) {
    const value2 = vector2.functionalFeatures?.[key] || false;
    totalFeatures++;
    if (value1 === value2) {
      matchingFeatures++;
    }
  }
  
  // Compare content features
  for (const [key, value1] of Object.entries(vector1.contentFeatures || {})) {
    const value2 = vector2.contentFeatures?.[key] || false;
    totalFeatures++;
    if (value1 === value2) {
      matchingFeatures++;
    }
  }
  
  // Compare state features
  for (const [key, value1] of Object.entries(vector1.stateFeatures || {})) {
    const value2 = vector2.stateFeatures?.[key] || false;
    totalFeatures++;
    if (value1 === value2) {
      matchingFeatures++;
    }
  }
  
  // Compare accessibility features
  for (const [key, value1] of Object.entries(vector1.accessibilityFeatures || {})) {
    const value2 = vector2.accessibilityFeatures?.[key] || false;
    totalFeatures++;
    if (value1 === value2) {
      matchingFeatures++;
    }
  }
  
  return totalFeatures > 0 ? matchingFeatures / totalFeatures : 0;
}

/**
 * Prune redundant pages from a graph
 */
export function pruneRedundantPages(graph, threshold = 0.8) {
  const clusters = clusterPagesByFunctionality(graph.nodes, threshold);
  const representatives = selectRepresentativePages(clusters);
  
  // Create new graph with only representative pages
  const prunedGraph = {
    nodes: representatives,
    edges: graph.edges.filter(edge => {
      const fromNode = representatives.find(n => n.id === edge.from);
      const toNode = representatives.find(n => n.id === edge.to);
      return fromNode && toNode;
    })
  };
  
  return {
    prunedGraph,
    clusters,
    reductionRatio: 1 - (representatives.length / graph.nodes.length)
  };
}

/**
 * Identify crawling gaps in the graph
 */
export function identifyCrawlingGaps(graph, maxDepth = 3) {
  const gaps = [];
  
  // Find isolated nodes (no connections)
  const connectedNodes = new Set();
  graph.edges.forEach(edge => {
    connectedNodes.add(edge.from);
    connectedNodes.add(edge.to);
  });
  
  const isolatedNodes = graph.nodes.filter(node => !connectedNodes.has(node.id));
  if (isolatedNodes.length > 0) {
    gaps.push({
      type: 'isolated_nodes',
      count: isolatedNodes.length,
      nodes: isolatedNodes
    });
  }
  
  // Find nodes with low connectivity
  const nodeConnections = new Map();
  graph.edges.forEach(edge => {
    nodeConnections.set(edge.from, (nodeConnections.get(edge.from) || 0) + 1);
    nodeConnections.set(edge.to, (nodeConnections.get(edge.to) || 0) + 1);
  });
  
  const lowConnectivityNodes = graph.nodes.filter(node => {
    const connections = nodeConnections.get(node.id) || 0;
    return connections < 2;
  });
  
  if (lowConnectivityNodes.length > 0) {
    gaps.push({
      type: 'low_connectivity',
      count: lowConnectivityNodes.length,
      nodes: lowConnectivityNodes
    });
  }
  
  // Find potential navigation paths not explored
  const unexploredPaths = findUnexploredPaths(graph);
  if (unexploredPaths.length > 0) {
    gaps.push({
      type: 'unexplored_paths',
      count: unexploredPaths.length,
      paths: unexploredPaths
    });
  }
  
  return gaps;
}

/**
 * Find unexplored navigation paths
 */
function findUnexploredPaths(graph) {
  const paths = [];
  
  // Look for pages with many links but few connections
  graph.nodes.forEach(node => {
    if (node.elements) {
      const linkElements = node.elements.filter(el => el.nodeType === 'a');
      const outgoingEdges = graph.edges.filter(edge => edge.from === node.id);
      
      if (linkElements.length > outgoingEdges.length * 2) {
        paths.push({
          node: node,
          potentialLinks: linkElements.length,
          exploredLinks: outgoingEdges.length,
          gap: linkElements.length - outgoingEdges.length
        });
      }
    }
  });
  
  return paths;
}

/**
 * Generate crawling recommendations
 */
export function generateCrawlingRecommendations(graph, gaps) {
  const recommendations = [];
  
  gaps.forEach(gap => {
    switch (gap.type) {
      case 'isolated_nodes':
        recommendations.push({
          priority: 'high',
          action: 'explore_connections',
          description: `Explore connections for ${gap.count} isolated nodes`,
          nodes: gap.nodes
        });
        break;
        
      case 'low_connectivity':
        recommendations.push({
          priority: 'medium',
          action: 'increase_connectivity',
          description: `Increase connectivity for ${gap.count} nodes with few connections`,
          nodes: gap.nodes
        });
        break;
        
      case 'unexplored_paths':
        recommendations.push({
          priority: 'high',
          action: 'explore_paths',
          description: `Explore ${gap.count} unexplored navigation paths`,
          paths: gap.paths
        });
        break;
    }
  });
  
  return recommendations;
}

/**
 * Optimize crawling strategy based on graph analysis
 */
export function optimizeCrawlingStrategy(graph, maxPages = 50) {
  // Cluster pages by functionality
  const clusters = clusterPagesByFunctionality(graph.nodes);
  
  // Select representative pages
  const representatives = selectRepresentativePages(clusters, maxPages);
  
  // Identify gaps
  const gaps = identifyCrawlingGaps(graph);
  
  // Generate recommendations
  const recommendations = generateCrawlingRecommendations(graph, gaps);
  
  return {
    clusters,
    representatives,
    gaps,
    recommendations,
    optimizationScore: calculateOptimizationScore(graph, representatives)
  };
}

/**
 * Calculate optimization score
 */
function calculateOptimizationScore(originalGraph, optimizedNodes) {
  const originalSize = originalGraph.nodes.length;
  const optimizedSize = optimizedNodes.length;
  const reductionRatio = 1 - (optimizedSize / originalSize);
  
  // Calculate coverage score (how well optimized nodes represent the original)
  const coverageScore = calculateCoverageScore(originalGraph.nodes, optimizedNodes);
  
  // Calculate connectivity score
  const connectivityScore = calculateConnectivityScore(optimizedNodes);
  
  return {
    reductionRatio,
    coverageScore,
    connectivityScore,
    overallScore: (reductionRatio * 0.4 + coverageScore * 0.4 + connectivityScore * 0.2)
  };
}

/**
 * Calculate coverage score
 */
function calculateCoverageScore(originalNodes, optimizedNodes) {
  // This is a simplified version - in practice, you'd want more sophisticated coverage analysis
  const coveredTypes = new Set();
  optimizedNodes.forEach(node => {
    if (node.elements) {
      node.elements.forEach(el => coveredTypes.add(el.nodeType));
    }
  });
  
  const totalTypes = new Set();
  originalNodes.forEach(node => {
    if (node.elements) {
      node.elements.forEach(el => totalTypes.add(el.nodeType));
    }
  });
  
  return totalTypes.size > 0 ? coveredTypes.size / totalTypes.size : 0;
}

/**
 * Calculate connectivity score
 */
function calculateConnectivityScore(nodes) {
  if (nodes.length <= 1) return 0;
  
  const connections = new Set();
  nodes.forEach(node => {
    // Count outgoing connections (simplified)
    connections.add(node.id);
  });
  
  return Math.min(connections.size / nodes.length, 1);
}
