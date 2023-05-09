var base_url = process.env.GSB_BASE_URL || "http://gsb-core:8000/gsb-core/api/v1/";

export const UPLOAD_MAP_TO_GSB_API = `${base_url}solutions/{}/design/functional-areas/{}/agents/{}/maps/save_map_details/`
export const SUBMIT_BTN_API_HIT_TO_GSB = `${base_url}solutions/{}/design/functional-areas/{}/agents/{}/maps/update_map/`
export const DOWNLOAD_AUTOCAD_FILE_TO_GSB_API = `${base_url}solutions/{}/design/functional-areas/{}/agents/{}/maps/download_file_url/`
export const EXPORT_DATA_TO_GSB_API = `${base_url}solutions/{}/design/functional-areas/{}/agents/{}/maps/save_imported_map_details/`