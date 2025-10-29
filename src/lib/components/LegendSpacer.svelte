<script>
	import { legendHeight } from '$lib/stores/legendHeight.js'
</script>

<!-- Spacer that dynamically adjusts to legend height -->
<div style="height: {$legendHeight}px;" aria-hidden="true"></div>
