# {{ .Site.Title }}
{{ with .Site.Params.description }}
{{ . }}
{{ end }}
> Full content for AI agents: [/llms-full.txt]({{ "llms-full.txt" | absURL }}) · Index: [/llms.txt]({{ "llms.txt" | absURL }})

## Articles (newest first)
{{ range (where .Site.RegularPages "Draft" false).ByDate.Reverse }}
- {{ .Date.Format "2006-01-02" }} — [{{ .Title }}]({{ .Permalink }})
{{- end }}
