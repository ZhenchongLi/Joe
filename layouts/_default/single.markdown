# {{ .Title }}
{{ with .Date }}
*{{ .Format "2006-01-02" }}*{{ with $.Params.categories }} · {{ delimit . ", " }}{{ end }}
{{ end }}{{ with .Params.description }}
> {{ . }}
{{ end }}
[Original]({{ .Permalink }})

{{ .RawContent }}
