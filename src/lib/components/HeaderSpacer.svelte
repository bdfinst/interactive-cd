<script>
	import { headerHeight } from '$lib/stores/headerHeight.js'
</script>

<!-- Spacer that dynamically adjusts to header height -->
<div style="height: {$headerHeight}px;" aria-hidden="true"></div>
